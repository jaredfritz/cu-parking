'use client';

import { EventCard } from './event-card';
import type { Event } from '@/types';

interface EventWithMeta extends Event {
  lowestPrice?: number;
  availableSpots?: number;
  isAway?: boolean;
  isBye?: boolean;
  badges?: string[];
  walkingTimeRange?: string;
}

interface EventGridProps {
  events: EventWithMeta[];
  title?: string;
}

export function EventGrid({ events, title = 'Upcoming Events' }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No upcoming events found.</p>
      </div>
    );
  }

  return (
    <section id="schedule" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              lowestPrice={event.lowestPrice}
              availableSpots={event.availableSpots}
              isAway={event.isAway}
              isBye={event.isBye}
              badges={event.badges}
              walkingTimeRange={event.walkingTimeRange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
