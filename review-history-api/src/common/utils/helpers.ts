import * as crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

export function generateOtp(length = 6): string {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const otp = crypto.randomInt(min, max);
  return otp.toString();
}

export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/gi, '');
}

export function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  // Convert Pakistani format
  if (cleaned.startsWith('03')) {
    cleaned = '+92' + cleaned.substring(1);
  }
  if (cleaned.startsWith('923')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

export function sanitizeInput(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function generateFingerprint(parts: (string | null | undefined)[]): string {
  const normalized = parts
    .filter((p): p is string => !!p)
    .map((p) => normalizeName(p))
    .join('|');
  return hashValue(normalized);
}

export function generateUuid(): string {
  return crypto.randomUUID();
}
