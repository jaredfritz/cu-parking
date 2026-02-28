'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isActive: boolean;
}

export function QRScanner({ onScan, isActive }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const startScanner = useCallback(async () => {
    if (!isActive || isScanning) return;

    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Debounce duplicate scans (2 second cooldown)
          const now = Date.now();
          if (
            decodedText === lastScanRef.current &&
            now - lastScanTimeRef.current < 2000
          ) {
            return;
          }

          lastScanRef.current = decodedText;
          lastScanTimeRef.current = now;
          onScan(decodedText);
        },
        () => {
          // QR code not found - ignore
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Scanner error:', message);

      if (message.includes('Permission')) {
        setHasPermission(false);
        setError('Camera permission denied. Please enable camera access.');
      } else {
        setError(`Failed to start scanner: ${message}`);
      }
    }
  }, [isActive, isScanning, onScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, [isScanning]);

  // Start/stop based on isActive prop
  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isActive, startScanner, stopScanner]);

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CameraOff className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
        <p className="text-muted-foreground mb-6">
          Please enable camera access in your browser settings to scan QR codes.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CameraOff className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Scanner Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={startScanner}>
          <Camera className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scanner container */}
      <div
        id="qr-reader"
        className="w-full aspect-square bg-black rounded-lg overflow-hidden"
      />

      {/* Loading state */}
      {!isScanning && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-white text-center">
            <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
            <p>Starting camera...</p>
          </div>
        </div>
      )}

      {/* Scan frame overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br" />

              {/* Scan line animation */}
              <div className="absolute inset-x-2 top-0 h-1 bg-green-500/50 animate-[scan_2s_linear_infinite]" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(240px);
          }
        }
      `}</style>
    </div>
  );
}
