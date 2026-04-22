import { Injectable, UnauthorizedException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { generateOtp, hashValue, normalizePhone } from '../../common/utils/helpers';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestEmailOtpDto } from './dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';

interface EmailOtpPayload {
  userId: string;
  email: string;
  otpHash: string;
  attempts: number;
  purpose: 'register' | 'login' | 'verify' | 'reset';
  createdAt: number;
}

interface OtpChallengeResponse {
  otpRequestId: string;
  cooldownSeconds: number;
  otpCode?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterUserDto, ipHash: string) {
    if (!dto.acceptTerms || !dto.acceptPrivacy) {
      throw new BadRequestException({
        code: 'LEGAL_ACCEPTANCE_REQUIRED',
        message: 'You must accept the Terms and Privacy Policy to register.',
      });
    }

    const email = dto.email.trim().toLowerCase();
    const phone = normalizePhone(dto.phone);

    const [emailExists, phoneExists] = await Promise.all([
      this.prisma.user.findFirst({ where: { email } }),
      this.prisma.user.findFirst({ where: { phoneE164: phone } }),
    ]);

    if (emailExists) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email is already registered.',
      });
    }

    if (phoneExists) {
      throw new ConflictException({
        code: 'PHONE_ALREADY_EXISTS',
        message: 'Phone is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        phoneE164: phone,
        passwordHash,
        displayName: dto.displayName?.trim() || null,
        role: 'user',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        legalVersion: '2026-04-20',
      },
    });

    const otp = await this.createEmailOtpRequest(user.id, email, 'register', ipHash);
    return {
      otpRequestId: otp.otpRequestId,
      cooldownSeconds: otp.cooldownSeconds,
      otpCode: otp.otpCode,
      email,
      requiresVerification: true,
    };
  }

  async login(dto: LoginUserDto, ipHash: string, userAgent: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        status: 'active',
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        code: 'LOGIN_INVALID',
        message: 'Invalid email or password.',
      });
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException({
        code: 'LOGIN_INVALID',
        message: 'Invalid email or password.',
      });
    }

    if (user.isEmailVerified) {
      const device = await this.upsertDevice(user.id, ipHash, userAgent);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phoneE164, user.role);

      await this.prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: hashValue(refreshToken),
          deviceId: device.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        requiresVerification: false,
        loginReason: 'none',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: true,
          phone: user.phoneE164,
          displayName: user.displayName,
          role: user.role,
        },
      };
    }

    const otp = await this.createEmailOtpRequest(user.id, email, 'login', ipHash);
    return {
      otpRequestId: otp.otpRequestId,
      cooldownSeconds: otp.cooldownSeconds,
      otpCode: otp.otpCode,
      email,
      requiresVerification: true,
      loginReason: 'email_not_verified',
    };
  }

  async requestEmailOtp(dto: RequestEmailOtpDto, ipHash: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { email, status: 'active' } });

    if (!user) {
      throw new BadRequestException({
        code: 'EMAIL_NOT_FOUND',
        message: 'No account found for this email.',
      });
    }

    const otp = await this.createEmailOtpRequest(user.id, email, 'verify', ipHash);
    return {
      otpRequestId: otp.otpRequestId,
      cooldownSeconds: otp.cooldownSeconds,
      otpCode: otp.otpCode,
      email,
      requiresVerification: true,
    };
  }

  async forgotPassword(dto: { email: string; adminOnly?: boolean }, ipHash: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        status: 'active',
        ...(dto.adminOnly ? { role: { in: ['admin', 'super_admin'] } } : {}),
      },
    });

    if (!user) {
      throw new BadRequestException({
        code: 'EMAIL_NOT_FOUND',
        message: 'No account found for this email.',
      });
    }

    const otp = await this.createEmailOtpRequest(user.id, email, 'reset', ipHash);
    return {
      otpRequestId: otp.otpRequestId,
      cooldownSeconds: otp.cooldownSeconds,
      otpCode: otp.otpCode,
      email,
      requiresVerification: true,
    };
  }

  async verifyResetOtp(dto: { otpRequestId: string; code: string }) {
    const otpDataStr = await this.redis.get(dto.otpRequestId);
    if (!otpDataStr) {
      throw new BadRequestException({
        code: 'OTP_EXPIRED',
        message: 'OTP has expired or is invalid.',
      });
    }

    const otpData = JSON.parse(otpDataStr) as EmailOtpPayload;
    if (otpData.purpose !== 'reset') {
      throw new BadRequestException({
        code: 'OTP_INVALID_PURPOSE',
        message: 'OTP purpose is invalid for password reset.',
      });
    }

    const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 5);
    if (otpData.attempts >= maxAttempts) {
      await this.redis.del(dto.otpRequestId);
      throw new BadRequestException({
        code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Request a new OTP.',
      });
    }

    if (hashValue(dto.code) !== otpData.otpHash) {
      otpData.attempts += 1;
      const ttl = await this.redis.ttl(dto.otpRequestId);
      await this.redis.set(dto.otpRequestId, JSON.stringify(otpData), ttl > 0 ? ttl : 60);
      throw new UnauthorizedException({
        code: 'OTP_INVALID',
        message: 'Invalid OTP code.',
      });
    }

    await this.redis.del(dto.otpRequestId);

    const user = await this.prisma.user.findFirst({
      where: { id: otpData.userId, email: otpData.email, status: 'active' },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User not found for password reset.',
      });
    }

    const resetToken = `reset_pwd_${uuidv4()}`;
    await this.redis.set(
      resetToken,
      JSON.stringify({ userId: user.id, email: user.email, createdAt: Date.now() }),
      15 * 60,
    );

    return {
      resetToken,
      expiresInSeconds: 15 * 60,
    };
  }

  async resetPassword(dto: { resetToken: string; newPassword: string }) {
    const tokenPayloadStr = await this.redis.get(dto.resetToken);
    if (!tokenPayloadStr) {
      throw new BadRequestException({
        code: 'RESET_TOKEN_INVALID',
        message: 'Reset token is invalid or expired.',
      });
    }

    const tokenPayload = JSON.parse(tokenPayloadStr) as { userId: string; email: string | null };
    const user = await this.prisma.user.findFirst({
      where: { id: tokenPayload.userId, status: 'active' },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User not found for password reset.',
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.redis.del(dto.resetToken);

    return { message: 'Password has been reset successfully.' };
  }

  async verifyEmailOtp(dto: VerifyEmailOtpDto, ipHash: string, userAgent: string) {
    const otpDataStr = await this.redis.get(dto.otpRequestId);
    if (!otpDataStr) {
      throw new BadRequestException({
        code: 'OTP_EXPIRED',
        message: 'OTP has expired or is invalid.',
      });
    }

    const otpData = JSON.parse(otpDataStr) as EmailOtpPayload;

    const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 5);
    if (otpData.attempts >= maxAttempts) {
      await this.redis.del(dto.otpRequestId);
      throw new BadRequestException({
        code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Request a new OTP.',
      });
    }

    if (hashValue(dto.code) !== otpData.otpHash) {
      otpData.attempts += 1;
      const ttl = await this.redis.ttl(dto.otpRequestId);
      await this.redis.set(dto.otpRequestId, JSON.stringify(otpData), ttl > 0 ? ttl : 60);
      throw new UnauthorizedException({
        code: 'OTP_INVALID',
        message: 'Invalid OTP code.',
      });
    }

    await this.redis.del(dto.otpRequestId);

    const user = await this.prisma.user.findFirst({
      where: { id: otpData.userId, email: otpData.email, status: 'active' },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User not found for OTP verification.',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        lastLoginAt: new Date(),
      },
    });

    const device = await this.upsertDevice(user.id, ipHash, userAgent);
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phoneE164, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashValue(refreshToken),
        deviceId: device.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
        phone: user.phoneE164,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async requestOtp(dto: RequestOtpDto, ipHash: string) {
    const phone = normalizePhone(dto.phone);

    // Rate limit: max OTP requests per phone per hour
    const maxRequests = this.config.get<number>('OTP_MAX_REQUESTS_PER_HOUR', 3);
    const rateLimitKey = `otp_rate:${phone}`;
    const currentCount = await this.redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await this.redis.expire(rateLimitKey, 3600);
    }
    if (currentCount > maxRequests) {
      throw new BadRequestException({
        code: 'OTP_RATE_LIMIT_EXCEEDED',
        message: 'Too many OTP requests. Please try again later.',
      });
    }

    // Rate limit by IP
    const ipRateLimitKey = `otp_ip_rate:${ipHash}`;
    const ipCount = await this.redis.incr(ipRateLimitKey);
    if (ipCount === 1) {
      await this.redis.expire(ipRateLimitKey, 3600);
    }
    if (ipCount > 10) {
      throw new BadRequestException({
        code: 'OTP_IP_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this device.',
      });
    }

    const otp = generateOtp();
    const otpRequestId = `otp_req_${uuidv4()}`;
    const expirationSeconds = this.config.get<number>('OTP_EXPIRATION_SECONDS', 300);
    const cooldownSeconds = this.config.get<number>('OTP_COOLDOWN_SECONDS', 60);

    // Store OTP hashed in Redis
    const otpData = JSON.stringify({
      phone,
      otpHash: hashValue(otp),
      attempts: 0,
      createdAt: Date.now(),
    });
    await this.redis.set(otpRequestId, otpData, expirationSeconds);

    const smsProvider = this.config.get<string>('SMS_PROVIDER', 'console');
    if (smsProvider === 'console') {
      this.logger.log(`OTP for ${phone}: ${otp}`);
    } else {
      this.logger.log(`SMS sent to ${phone}`);
    }

    return {
      otpRequestId,
      cooldownSeconds,
      ...(this.shouldExposeOtpCode() ? { otpCode: otp } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ipHash: string, userAgent: string) {
    const otpDataStr = await this.redis.get(dto.otpRequestId);
    if (!otpDataStr) {
      throw new BadRequestException({
        code: 'OTP_EXPIRED',
        message: 'OTP has expired or is invalid.',
      });
    }

    const otpData = JSON.parse(otpDataStr) as {
      phone: string;
      otpHash: string;
      attempts: number;
      createdAt: number;
    };

    const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 5);
    if (otpData.attempts >= maxAttempts) {
      await this.redis.del(dto.otpRequestId);
      throw new BadRequestException({
        code: 'OTP_MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Request a new OTP.',
      });
    }

    const providedHash = hashValue(dto.code);
    if (providedHash !== otpData.otpHash) {
      otpData.attempts += 1;
      const ttl = await this.redis.ttl(dto.otpRequestId);
      await this.redis.set(dto.otpRequestId, JSON.stringify(otpData), ttl > 0 ? ttl : 60);
      throw new UnauthorizedException({
        code: 'OTP_INVALID',
        message: 'Invalid OTP code.',
      });
    }

    await this.redis.del(dto.otpRequestId);

    let user = await this.prisma.user.findUnique({
      where: { phoneE164: otpData.phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneE164: otpData.phone,
          isPhoneVerified: true,
          role: 'user',
        },
      });
      this.logger.log(`New user created: ${user.id}`);
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isPhoneVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    const device = await this.upsertDevice(user.id, ipHash, userAgent);

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phoneE164, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashValue(refreshToken),
        deviceId: device.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phoneE164,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async adminLogin(dto: AdminLoginDto, ipHash: string, userAgent: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: { in: ['admin', 'super_admin'] },
        status: 'active',
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        code: 'ADMIN_LOGIN_INVALID',
        message: 'Invalid email or password.',
      });
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException({
        code: 'ADMIN_LOGIN_INVALID',
        message: 'Invalid email or password.',
      });
    }

    const device = await this.upsertDevice(user.id, ipHash, userAgent);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.phoneE164, user.role);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashValue(refreshToken),
        deviceId: device.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phoneE164,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_MISSING',
        message: 'Refresh token is required.',
      });
    }

    const tokenHash = hashValue(refreshToken);

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) {
      const usedSession = await this.prisma.session.findFirst({
        where: { refreshTokenHash: tokenHash },
      });

      if (usedSession) {
        await this.prisma.session.updateMany({
          where: { userId: usedSession.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        this.logger.warn(`Token reuse detected for user ${usedSession.userId}. All sessions revoked.`);
      }

      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Invalid or expired refresh token.',
      });
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      session.user.id,
      session.user.phoneE164,
      session.user.role,
    );

    await this.prisma.session.create({
      data: {
        userId: session.user.id,
        refreshTokenHash: hashValue(newRefreshToken),
        deviceId: session.deviceId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        emailVerified: (session.user as any).isEmailVerified ?? false,
        phone: session.user.phoneE164,
        displayName: session.user.displayName,
        role: session.user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    const tokenHash = hashValue(refreshToken);
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async createEmailOtpRequest(
    userId: string,
    email: string,
    purpose: EmailOtpPayload['purpose'],
    ipHash: string,
  ): Promise<OtpChallengeResponse> {
    const rateLimitKey = `email_otp_rate:${email}`;
    const currentCount = await this.redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await this.redis.expire(rateLimitKey, 3600);
    }
    if (currentCount > this.config.get<number>('OTP_MAX_REQUESTS_PER_HOUR', 3)) {
      throw new BadRequestException({
        code: 'OTP_RATE_LIMIT_EXCEEDED',
        message: 'Too many OTP requests. Please try again later.',
      });
    }

    const ipRateLimitKey = `email_otp_ip_rate:${ipHash}`;
    const ipCount = await this.redis.incr(ipRateLimitKey);
    if (ipCount === 1) {
      await this.redis.expire(ipRateLimitKey, 3600);
    }
    if (ipCount > 20) {
      throw new BadRequestException({
        code: 'OTP_IP_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this device.',
      });
    }

    const otp = generateOtp();
    const otpRequestId = `email_otp_req_${uuidv4()}`;
    const expirationSeconds = this.config.get<number>('OTP_EXPIRATION_SECONDS', 300);
    const cooldownSeconds = this.config.get<number>('OTP_COOLDOWN_SECONDS', 60);

    const payload: EmailOtpPayload = {
      userId,
      email,
      otpHash: hashValue(otp),
      attempts: 0,
      purpose,
      createdAt: Date.now(),
    };

    await this.redis.set(otpRequestId, JSON.stringify(payload), expirationSeconds);

    // Email provider hook; defaults to console in development.
    this.logger.log(`Email OTP (${purpose}) for ${email}: ${otp}`);

    return {
      otpRequestId,
      cooldownSeconds,
      ...(this.shouldExposeOtpCode() ? { otpCode: otp } : {}),
    };
  }

  private shouldExposeOtpCode(): boolean {
    const explicit = this.config.get<string>('AUTH_EXPOSE_OTP_CODE');
    if (explicit !== undefined) {
      return explicit === 'true';
    }
    return this.config.get<string>('NODE_ENV', 'development') !== 'production';
  }

  private async upsertDevice(userId: string, ipHash: string, userAgent: string) {
    const deviceFingerprintHash = hashValue(userAgent + ipHash);
    const existing = await this.prisma.userDevice.findFirst({
      where: {
        userId,
        deviceFingerprintHash,
      },
    });

    if (!existing) {
      return this.prisma.userDevice.create({
        data: {
          userId,
          deviceFingerprintHash,
          firstIpHash: ipHash,
          lastIpHash: ipHash,
          userAgentHash: hashValue(userAgent),
        },
      });
    }

    await this.prisma.userDevice.update({
      where: { id: existing.id },
      data: { lastIpHash: ipHash, lastSeenAt: new Date() },
    });

    return existing;
  }

  private async generateTokens(userId: string, phone: string, role: string) {
    const payload = { sub: userId, phone, role };

    const accessToken = this.jwt.sign(payload);

    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshToken = this.jwt.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
