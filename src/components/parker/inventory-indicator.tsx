'use client';

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InventoryIndicatorProps {
  availableSpots: number;
  totalCapacity?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function InventoryIndicator({
  availableSpots,
  totalCapacity,
  showCount = true,
  size = 'md',
}: InventoryIndicatorProps) {
  const getStatus = () => {
    if (availableSpots === 0) {
      return {
        label: 'Sold Out',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
      };
    }
    if (availableSpots <= 10) {
      return {
        label: `Only ${availableSpots} left!`,
        variant: 'secondary' as const,
        icon: AlertCircle,
        color: 'text-orange-600',
      };
    }
    if (availableSpots <= 30) {
      return {
        label: 'Limited',
        variant: 'secondary' as const,
        icon: AlertCircle,
        color: 'text-yellow-600',
      };
    }
    return {
      label: 'Available',
      variant: 'outline' as const,
      icon: CheckCircle,
      color: 'text-green-600',
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge variant={status.variant} className={cn(sizeClasses[size], 'gap-1')}>
      <Icon className={cn(iconSizes[size], status.color)} />
      {showCount && totalCapacity ? (
        <span>
          {availableSpots}/{totalCapacity}
        </span>
      ) : (
        <span>{status.label}</span>
      )}
    </Badge>
  );
}
