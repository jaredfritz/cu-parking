'use client';

import { LotCard, type LotCardData } from './lot-card';

interface LotListProps {
  lots: LotCardData[];
  eventId: string;
  activeLotId: string | null;
  onDetailsClick: (lotId: string) => void;
  onHover: (lotId: string | null) => void;
}

export function LotList({
  lots,
  eventId,
  activeLotId,
  onDetailsClick,
  onHover,
}: LotListProps) {
  const sortedLots = [...lots].sort((a, b) => {
    // Third-party lots always go last
    const aThird = a.isThirdParty ? 1 : 0;
    const bThird = b.isThirdParty ? 1 : 0;
    if (aThird !== bThird) return aThird - bThird;

    // Price descending, then distance ascending
    if (b.price_cents !== a.price_cents) return b.price_cents - a.price_cents;
    return (a.distance_miles ?? 999) - (b.distance_miles ?? 999);
  });

  if (lots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No parking lots available for this event.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedLots.map((lot) => (
        <LotCard
          key={lot.id}
          lot={lot}
          eventId={eventId}
          isActive={activeLotId === lot.id}
          onDetailsClick={() => onDetailsClick(lot.id)}
          onHover={onHover}
        />
      ))}
    </div>
  );
}
