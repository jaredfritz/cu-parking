'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/gate/qr-scanner';
import { ScanResult } from '@/components/gate/scan-result';
import type { ScanResponse } from '@/types';

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lotId = searchParams.get('lot') || '';

  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);

  const handleScan = useCallback(async (qrCode: string) => {
    setIsScanning(false);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: qrCode,
          lot_id: lotId,
        }),
      });

      const data: ScanResponse = await response.json();
      setScanResult(data);
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        status: 'invalid_qr',
        message: 'Failed to validate pass. Please try again.',
      });
    }
  }, [lotId]);

  const handleDismiss = useCallback(() => {
    setScanResult(null);
    setIsScanning(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="bg-black/80 p-4 flex items-center gap-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => router.push('/gate')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="text-white">
          <h1 className="font-bold">Scan QR Code</h1>
          <p className="text-sm text-white/60">Point camera at parking pass</p>
        </div>
      </header>

      {/* Scanner */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <QRScanner onScan={handleScan} isActive={isScanning} />

          <p className="text-center text-white/60 text-sm mt-6">
            Position the QR code within the frame
          </p>
        </div>
      </main>

      {/* Scan result overlay */}
      {scanResult && (
        <ScanResult
          status={scanResult.success ? 'success' : scanResult.status as 'error' | 'already_checked_in' | 'wrong_lot' | 'wrong_event'}
          message={scanResult.message}
          reservation={scanResult.reservation}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
