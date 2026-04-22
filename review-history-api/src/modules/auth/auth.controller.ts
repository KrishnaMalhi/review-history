import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestEmailOtpDto } from './dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators';
import { hashValue } from '../../common/utils/helpers';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getRefreshCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const configuredSameSite = (process.env.AUTH_COOKIE_SAME_SITE || '').toLowerCase();
    const sameSite =
      configuredSameSite === 'lax' || configuredSameSite === 'strict' || configuredSameSite === 'none'
        ? (configuredSameSite as 'lax' | 'strict' | 'none')
        : isProduction
          ? 'none'
          : 'strict';

    const secure =
      process.env.AUTH_COOKIE_SECURE !== undefined
        ? process.env.AUTH_COOKIE_SECURE === 'true'
        : isProduction;

    const domain = process.env.AUTH_COOKIE_DOMAIN || undefined;

    return {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain,
    } as const;
  }

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register user and send email OTP verification' })
  async register(@Body() dto: RegisterUserDto, @Req() req: Request) {
    const ipHash = hashValue(req.ip || 'unknown');
    return this.authService.register(dto, ipHash);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user; require email OTP only if email is not verified' })
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipHash = hashValue(req.ip || 'unknown');
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await this.authService.login(dto, ipHash, userAgent);

    if ('refreshToken' in result && result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());
    }

    return 'refreshToken' in result
      ? {
          requiresVerification: false,
          loginReason: result.loginReason,
          accessToken: result.accessToken,
          user: result.user,
        }
      : result;
  }

  @Public()
  @Post('request-email-otp')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request email OTP for verification' })
  async requestEmailOtp(@Body() dto: RequestEmailOtpDto, @Req() req: Request) {
    const ipHash = hashValue(req.ip || 'unknown');
    return this.authService.requestEmailOtp(dto, ipHash);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP by email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const ipHash = hashValue(req.ip || 'unknown');
    return this.authService.forgotPassword(dto, ipHash);
  }

  @Public()
  @Post('verify-reset-otp')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset OTP and issue reset token' })
  async verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a valid reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('verify-email-otp')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email OTP and authenticate' })
  async verifyEmailOtp(
    @Body() dto: VerifyEmailOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipHash = hashValue(req.ip || 'unknown');
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await this.authService.verifyEmailOtp(dto, ipHash, userAgent);

    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('request-otp')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for phone verification' })
  async requestOtp(@Body() dto: RequestOtpDto, @Req() req: Request) {
    const ipHash = hashValue(req.ip || 'unknown');
    return this.authService.requestOtp(dto, ipHash);
  }

  @Public()
  @Post('verify-otp')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and authenticate' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipHash = hashValue(req.ip || 'unknown');
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await this.authService.verifyOtp(dto, ipHash, userAgent);

    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('admin/login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with email and password' })
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipHash = hashValue(req.ip || 'unknown');
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await this.authService.adminLogin(dto, ipHash, userAgent);

    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refreshTokens(refreshToken);

    res.cookie('refreshToken', result.refreshToken, this.getRefreshCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(refreshToken);

    const options = this.getRefreshCookieOptions();
    res.clearCookie('refreshToken', {
      path: '/',
      domain: options.domain,
      sameSite: options.sameSite,
      secure: options.secure,
    });
    return { message: 'Logged out successfully' };
  }
}
