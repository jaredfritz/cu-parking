import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}

export function generateQRPayload(reservationId: string): string {
  // Format: CUP:<reservationId>:<verification>
  const verification = uuidv4().slice(0, 8).toUpperCase();
  return `CUP:${reservationId}:${verification}`;
}

export function parseQRPayload(payload: string): { reservationId: string; verification: string } | null {
  const parts = payload.split(':');
  if (parts.length !== 3 || parts[0] !== 'CUP') {
    return null;
  }
  return {
    reservationId: parts[1],
    verification: parts[2],
  };
}
