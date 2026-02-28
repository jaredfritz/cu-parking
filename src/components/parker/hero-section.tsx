'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatEventDate, formatEventTime } from '@/lib/constants';
import type { Event } from '@/types';

interface HeroSectionProps {
  homeGames: (Event & { id: string })[];
}

export function HeroSection({ homeGames }: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? homeGames.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.event_date.includes(query) ||
          formatEventDate(e.event_date).toLowerCase().includes(query.toLowerCase())
      )
    : homeGames;

  const handleViewAllEvents = () => {
    document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <section className="bg-white pt-16 pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left column */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight mb-4">
              Gameday Parking,<br />Guaranteed.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Find the best deals for Illinois Football and reserve your spot in seconds.
            </p>

            <div className="space-y-3">
              {/* Location (read-only) */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                Memorial Stadium
              </div>

              {/* Event search with suggestions */}
              <div ref={containerRef} className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by event or date"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Suggestions */}
                {showDropdown && filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                    {filtered.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span className="font-medium text-sm text-gray-900">{event.name}</span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {formatEventDate(event.event_date)} · {formatEventTime(event.event_time)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button
                onClick={handleViewAllEvents}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold text-sm h-12 rounded-lg"
              >
                Find My Spot
              </Button>
            </div>
          </div>

          {/* Right column — stadium image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden hidden lg:block shadow-2xl">
            <Image
              src="/memorial stadium.webp"
              alt="Memorial Stadium"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
