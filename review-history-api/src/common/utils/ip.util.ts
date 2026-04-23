import * as crypto from 'crypto';

export function hashIp(rawIp: string): string {
  return crypto.createHash('sha256').update(rawIp).digest('hex');
}
