'use client';

import Link from 'next/link';
import { PersonStanding } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, BADGE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { LotWithInventory } from '@/types';

export interface LotCardData extends LotWithInventory {
  address?: string;
  distance_miles?: number;
  isThirdParty?: boolean;
  thingsToKnow?: string[];
}

interface LotCardProps {
  lot: LotCardData;
  eventId: string;
  isActive: boolean;
  onDetailsClick: () => void;
  onHover: (lotId: string | null) => void;
}

export function LotCard({ lot, eventId, isActive, onDetailsClick, onHover }: LotCardProps) {
  const isLowInventory = lot.available_spots > 0 && lot.available_spots <= 10;
  const isSoldOut = lot.available_spots === 0;
  const isThirdParty = lot.isThirdParty ?? false;

  const featureBadge = lot.badges?.find((b) =>
    ['easy_exit', 'best_value', 'premium', 'ada'].includes(b)
  );
  const featureConfig = featureBadge ? BADGE_CONFIG[featureBadge] : null;

  return (
    <div
      className={cn(
        'border rounded-lg bg-white transition-shadow',
        isThirdParty && 'opacity-80',
        isActive ? 'border-primary shadow-md' : 'border-gray-200 hover:shadow-sm'
      )}
      onMouseEnter={() => onHover(lot.id)}
      onMouseLeave={() => onHover(null)}
    >
      {featureConfig && (
        <div className="px-3 pt-2.5">
          <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded">
            {featureConfig.label}
          </span>
        </div>
      )}

      <div className="flex gap-3 p-3">
        {/* Lot thumbnail */}
        <div className="flex-shrink-0 w-[72px] h-[72px] bg-gray-100 rounded-md flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight font-medium">
          Lot<br />Photo
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-gray-900 leading-snug">
                {lot.name}
              </h3>
              {lot.address && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{lot.address}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              {isThirdParty ? (
                <>
                  <p className="text-lg font-bold text-gray-400 leading-none">$$$</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">3rd Party</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {formatPrice(lot.price_cents)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Subtotal</p>
                </>
              )}
            </div>
          </div>

          {lot.walking_time_minutes && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <PersonStanding className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {lot.walking_time_minutes} min
                {lot.distance_miles !== undefined ? ` (${lot.distance_miles} mi)` : ''}
              </span>
            </div>
          )}

          {isLowInventory && (
            <p className="text-xs font-semibold text-amber-600 mt-1.5">
              {lot.available_spots} spots left
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 pb-3">
        <button
          onClick={(e) => { e.stopPropagation(); onDetailsClick(); }}
          className="text-sm font-semibold text-primary hover:underline focus:outline-none"
        >
          Details
        </button>
        <div className="flex-1" />
        {isThirdParty ? (
          <span className="text-xs text-gray-400 font-medium">In-Person Only</span>
        ) : isSoldOut ? (
          <span className="text-sm text-gray-400 font-medium">Sold Out</span>
        ) : (
          <Link href={`/events/${eventId}/checkout?lot=${lot.id}`} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold px-5">
              Book Now
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
