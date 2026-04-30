import crypto from 'crypto';

// Truncate an ISO datetime to minute precision (YYYY-MM-DDTHH:MM)
export function truncateDatetimeToMinute(): string {
  const dt = new Date().toISOString();
  return dt.slice(0, 16);
}

// Compute expected base64 sha256 of publicKey + truncatedDatetime
export function createHashQR(): string {
  const publicKey = process.env.QR_PUBLIC_KEY || process.env.PUBLIC_KEY;
  if (!publicKey) throw new Error('Public key not configured');
  const truncated = truncateDatetimeToMinute();
  return crypto
    .createHash('sha256')
    .update(publicKey + truncated)
    .digest('base64');
}

// Verify provided base64 signature matches expected hash (timing-safe)
export function verifyQrSignature(providedSignatureBase64: string): boolean {
  try {
    const expected = createHashQR();
    const expectedBuf = Buffer.from(expected, 'base64');
    const providedBuf = Buffer.from(providedSignatureBase64, 'base64');
    if (expectedBuf.length !== providedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch (e) {
    return false;
  }
}
