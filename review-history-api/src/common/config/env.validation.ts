import { Logger } from '@nestjs/common';

interface EnvRule {
  key: string;
  required: boolean;
  pattern?: RegExp;
  default?: string;
}

const envRules: EnvRule[] = [
  { key: 'NODE_ENV', required: false, default: 'development', pattern: /^(development|production|test)$/ },
  { key: 'PORT', required: false, default: '5000', pattern: /^\d+$/ },
  { key: 'API_BASE_URL', required: false, default: 'http://localhost:5000' },
  { key: 'DATABASE_URL', required: true, pattern: /^postgresql:\/\// },
  { key: 'REDIS_HOST', required: false, default: 'localhost' },
  { key: 'REDIS_PORT', required: false, default: '6379', pattern: /^\d+$/ },
  { key: 'JWT_ACCESS_SECRET', required: true },
  { key: 'JWT_REFRESH_SECRET', required: true },
  { key: 'JWT_ACCESS_EXPIRATION', required: false, default: '15m' },
  { key: 'JWT_REFRESH_EXPIRATION', required: false, default: '7d' },
  { key: 'CORS_ORIGIN', required: false, default: 'http://localhost:5002' },
  { key: 'CORS_ORIGIN_WEB', required: false, default: 'http://localhost:5002' },
  { key: 'CORS_ORIGIN_ADMIN', required: false, default: 'http://localhost:5001' },
  { key: 'THROTTLE_TTL', required: false, default: '60000', pattern: /^\d+$/ },
  { key: 'THROTTLE_LIMIT', required: false, default: '60', pattern: /^\d+$/ },
  // OTP
  { key: 'OTP_COOLDOWN_SECONDS', required: false, default: '60', pattern: /^\d+$/ },
  { key: 'OTP_MAX_ATTEMPTS', required: false, default: '5', pattern: /^\d+$/ },
  { key: 'OTP_EXPIRATION_SECONDS', required: false, default: '300', pattern: /^\d+$/ },
  // Mailer (all optional — SMTP disabled if SMTP_HOST is absent)
  { key: 'SMTP_HOST', required: false },
  { key: 'SMTP_PORT', required: false, default: '587', pattern: /^\d+$/ },
  { key: 'SMTP_SECURE', required: false, default: 'false', pattern: /^(true|false)$/ },
  { key: 'SMTP_USER', required: false },
  { key: 'SMTP_PASS', required: false },
  { key: 'MAIL_FROM', required: false, default: 'noreply@reviewhistory.pk' },
  { key: 'LEGAL_EMAIL', required: false, default: 'legal@reviewhistory.pk' },
  // Upload
  { key: 'UPLOAD_DIR', required: false, default: 'uploads' },
  { key: 'UPLOAD_MAX_FILE_SIZE_MB', required: false, default: '5', pattern: /^\d+$/ },
  // Public site URL
  { key: 'SITE_URL', required: false, default: 'https://reviewhistory.pk' },
];

export function validateEnvironment(): void {
  const logger = new Logger('EnvValidation');
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of envRules) {
    const value = process.env[rule.key];

    if (!value) {
      if (rule.required) {
        errors.push(`Missing required environment variable: ${rule.key}`);
      } else if (rule.default) {
        warnings.push(`${rule.key} not set, using default: ${rule.default}`);
      }
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(`Invalid value for ${rule.key}: must match ${rule.pattern}`);
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_ACCESS_SECRET?.includes('change-in-production')) {
      errors.push('JWT_ACCESS_SECRET must be changed in production');
    }
    if (process.env.JWT_REFRESH_SECRET?.includes('change-in-production')) {
      errors.push('JWT_REFRESH_SECRET must be changed in production');
    }
    if (process.env.CORS_ORIGIN?.includes('localhost')) {
      warnings.push('CORS_ORIGIN contains localhost in production');
    }
    if (!process.env.SMTP_HOST) {
      warnings.push('SMTP_HOST is not set — email alerts to LEGAL_EMAIL will be silently skipped in production');
    }
    if (process.env.SITE_URL?.includes('localhost')) {
      warnings.push('SITE_URL contains localhost in production — share/invite links will be broken');
    }
    if (process.env.API_BASE_URL?.includes('localhost')) {
      warnings.push('API_BASE_URL contains localhost in production — upload URLs served to clients will be broken');
    }
  }

  for (const w of warnings) {
    logger.warn(w);
  }

  if (errors.length > 0) {
    for (const e of errors) {
      logger.error(e);
    }
    throw new Error(`Environment validation failed with ${errors.length} error(s)`);
  }

  logger.log('Environment validation passed');
}
