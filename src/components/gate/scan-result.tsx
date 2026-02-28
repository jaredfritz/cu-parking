'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReservationWithDetails } from '@/types';

type ScanStatus = 'success' | 'error' | 'already_checked_in' | 'wrong_lot' | 'wrong_event';

interface ScanResultProps {
  status: ScanStatus;
  message: string;
  reservation?: ReservationWithDetails;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const STATUS_CONFIG: Record<ScanStatus, {
  icon: typeof CheckCircle;
  bgColor: string;
  iconColor: string;
  title: string;
}> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-600',
    iconColor: 'text-white',
    title: 'Check-In Successful!',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-600',
    iconColor: 'text-white',
    title: 'Invalid Pass',
  },
  already_checked_in: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-500',
    iconColor: 'text-white',
    title: 'Already Checked In',
  },
  wrong_lot: {
    icon: AlertCircle,
    bgColor: 'bg-orange-500',
    iconColor: 'text-white',
    title: 'Wrong Lot',
  },
  wrong_event: {
    icon: XCircle,
    bgColor: 'bg-red-600',
    iconColor: 'text-white',
    title: 'Wrong Event',
  },
};

export function ScanResult({
  status,
  message,
  reservation,
  onDismiss,
  autoDismissMs = 3000,
}: ScanResultProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Auto-dismiss on success
  useEffect(() => {
    if (status === 'success' && autoDismissMs > 0) {
      const timer = setTimeout(onDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [status, autoDismissMs, onDismiss]);

  // Haptic feedback
  useEffect(() => {
    if ('vibrate' in navigator) {
      if (status === 'success') {
        navigator.vibrate(100);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [status]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center p-6',
        config.bgColor
      )}
    >
      {/* Icon */}
      <Icon className={cn('h-24 w-24 mb-6', config.iconColor)} />

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-2">
        {config.title}
      </h1>

      {/* Message */}
      <p className="text-lg text-white/90 text-center mb-8">
        {message}
      </p>

      {/* Reservation details (if available) */}
      {reservation && status === 'success' && (
        <div className="bg-white/20 backdrop-blur rounded-lg p-4 w-full max-w-sm mb-8">
          <div className="flex items-center gap-3 text-white">
            <Car className="h-8 w-8" />
            <div>
              <p className="font-mono text-xl font-bold">
                {reservation.license_plate}
              </p>
              <p className="text-sm text-white/80">
                {reservation.lot.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss button */}
      <Button
        variant="outline"
        size="lg"
        className="bg-white text-gray-900 hover:bg-gray-100 border-0"
        onClick={onDismiss}
      >
        {status === 'success' ? 'Scan Next' : 'Try Again'}
      </Button>

      {/* Auto-dismiss indicator for success */}
      {status === 'success' && (
        <p className="text-sm text-white/60 mt-4">
          Auto-dismissing...
        </p>
      )}
    </div>
  );
}
