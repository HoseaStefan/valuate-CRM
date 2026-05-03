import crypto from 'crypto';

// Truncate an ISO datetime to minute precision (YYYY-MM-DDTHH:MM)
export function truncateDatetimeToMinute(date: Date = new Date()): string {
  const dt = date.toISOString();
  return dt.slice(0, 16);
}

// Compute expected base64 sha256 of publicKey + truncatedDatetime
export function createHashQR(atTime: Date = new Date()): string {
  const publicKey = process.env.QR_PUBLIC_KEY || process.env.PUBLIC_KEY;
  if (!publicKey) throw new Error('Public key not configured');
  const truncated = truncateDatetimeToMinute(atTime);
  return crypto
    .createHash('sha256')
    .update(publicKey + truncated)
    .digest('base64');
}

// Verify provided base64 signature matches expected hash (timing-safe)
export function verifyQrSignature(providedSignatureBase64: string): boolean {
  try {
    const providedBuf = Buffer.from(providedSignatureBase64, 'base64');
    const now = new Date();
    const offsets = [0, -1, 1];

    for (const offset of offsets) {
      const candidateTime = new Date(now.getTime() + offset * 60 * 1000);
      const expected = createHashQR(candidateTime);
      const expectedBuf = Buffer.from(expected, 'base64');
      if (expectedBuf.length !== providedBuf.length) continue;
      if (crypto.timingSafeEqual(expectedBuf, providedBuf)) {
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Generate QR code URL for attendance scanning
export function generateAttendanceQRCode(): { qrImageUrl: string} {
  const signature = createHashQR();
  console.log("Generated QR signature:", signature);
  
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(signature)}&bgcolor=ffffff&color=1e293b`;
  
  return { qrImageUrl };
}
