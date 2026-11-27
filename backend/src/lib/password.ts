import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) {
        return false;
    }
    const hashToVerify = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(hash, 'hex');
    const hashToVerifyBuffer = Buffer.from(hashToVerify.toString('hex'), 'hex');
    return timingSafeEqual(storedHashBuffer, hashToVerifyBuffer);
}

export { hashPassword, verifyPassword };