'use client';

import Link from 'next/link';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEventDate, formatEventTime, formatPrice } from '@/lib/constants';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  lowestPrice?: number;
  availableSpots?: number;
  badges?: string[];
  walkingTimeRange?: string;
}

export function EventCard({
  event,
  lowestPrice,
  availableSpots,
  badges = [],
  walkingTimeRange,
}: EventCardProps) {
  const getInventoryStatus = () => {
    if (availableSpots === undefined) return null;
    if (availableSpots === 0) {
      return { label: 'Sold Out', variant: 'destructive' as const };
    }
    if (availableSpots <= 20) {
      return { label: `Only ${availableSpots} left!`, variant: 'destructive' as const };
    }
    return null;
  };

  const status = getInventoryStatus();

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-0">
        {/* Horizontal layout on mobile, stack on larger screens */}
        <div className="flex flex-row gap-4 p-4">
          {/* Date block */}
          <div className="flex-shrink-0 w-16 h-16 bg-primary/5 rounded-lg flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-2xl font-bold text-primary">
              {new Date(event.event_date + 'T00:00:00').getDate()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold truncate">{event.name}</h3>

                {event.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {event.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatEventTime(event.event_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Gies Memorial Stadium</span>
                  </div>
                  {walkingTimeRange && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{walkingTimeRange} walk</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Price and status */}
              <div className="text-right flex-shrink-0">
                {lowestPrice !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">from</p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(lowestPrice)}
                    </p>
                  </div>
                )}
                {status && (
                  <Badge variant={status.variant} className="mt-1.5">
                    <AlertCircle className="h-3 w-3" />
                    {status.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="mt-4">
              <Link href={`/events/${event.id}`} className="block">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.02]"
                  disabled={availableSpots === 0}
                >
                  {availableSpots === 0 ? 'Sold Out' : 'Find Parking'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
