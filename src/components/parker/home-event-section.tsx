'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from './hero-section';
import { EventGrid } from './event-grid';
import { ValueProps } from './value-props';
import { getLots } from '@/lib/lots-store';
import { getEvents, eventName } from '@/lib/events-store';
import type { Event } from '@/types';

type HomeEvent = Event & {
  lowestPrice?: number;
  isAway?: boolean;
  isBye?: boolean;
  walkingTimeRange?: string;
};

export function HomeEventSection() {
  const [upcomingHomeGames, setUpcomingHomeGames] = useState<HomeEvent[]>([]);

  useEffect(() => {
    async function load() {
      const [lots, events] = await Promise.all([getLots(), getEvents()]);
      const activeLots = lots.filter((l) => l.isActive && !l.isThirdParty);
      const lowestPrice = activeLots.length > 0
        ? Math.min(...activeLots.map((l) => l.price_cents))
        : undefined;
      const walkingTimeRange = activeLots.length > 0
        ? `${Math.min(...activeLots.map((l) => l.walking_time_minutes))}+ min`
        : undefined;

      const today = new Date().toISOString().split('T')[0];

      const allEvents: HomeEvent[] = events.map((event) => {
        const isHome = !event.isAway && !event.isBye;
        return {
          id: event.id,
          property_id: 'property-1',
          name: eventName(event),
          event_date: event.date,
          event_time: event.time,
          gates_open_time: null,
          presale_cutoff: null,
          in_person_enabled: true,
          is_published: event.isPublished,
          image_url: null,
          description: event.description || null,
          season_id: 'season-2026',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lowestPrice: isHome ? lowestPrice : undefined,
          isAway: event.isAway,
          isBye: event.isBye,
          walkingTimeRange: isHome ? walkingTimeRange : undefined,
        };
      });

      setUpcomingHomeGames(
        allEvents.filter((e) => !e.isAway && !e.isBye && e.event_date >= today)
      );
    }
    load();
  }, []);

  return (
    <>
      <HeroSection homeGames={upcomingHomeGames} />
      <ValueProps />
      <EventGrid events={upcomingHomeGames} title="2026 Season Schedule" />
    </>
  );
}
