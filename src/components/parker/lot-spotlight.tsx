'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getLots, type AdminLot } from '@/lib/lots-store';
import { formatPrice } from '@/lib/constants';

export function LotSpotlight() {
  const [activeLots, setActiveLots] = useState<AdminLot[]>([]);

  useEffect(() => {
    getLots().then((lots) => setActiveLots(lots.filter((l) => l.isActive)));
  }, []);

  if (activeLots.length === 0) return null;

  const [spotlight, ...rest] = activeLots;
  const otherLots = rest.slice(0, 3);
  const lowestPrice = Math.min(...activeLots.map((l) => l.price_cents));

  return (
    <section className="px-[5%] py-[60px]" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Image column */}
        <div className="md:flex-1">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium">
            Lot Photo
          </div>
        </div>

        {/* Content column */}
        <div className="md:flex-1 flex flex-col justify-center">
          <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-2">
            Flagship Location
          </p>
          <h2 className="text-3xl font-bold text-primary mb-2">
            {spotlight.name}
          </h2>
          <p className="font-semibold text-gray-500 flex items-center gap-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            {spotlight.address} · {spotlight.walking_time_minutes}-min walk
          </p>

          {otherLots.length > 0 && (
            <div className="mt-4 space-y-1">
              {otherLots.map((lot) => (
                <p key={lot.id} className="text-sm text-gray-400">
                  {lot.name} — {lot.address}
                </p>
              ))}
            </div>
          )}

          <p className="text-2xl font-extrabold text-primary mt-6">
            Starting at {formatPrice(lowestPrice)}
          </p>

          <Link
            href="/events/event-1"
            className="mt-6 w-fit border-2 border-primary text-primary bg-transparent font-bold px-6 py-3 rounded hover:bg-primary hover:text-white transition-colors text-sm"
          >
            VIEW LOT DETAILS
          </Link>
        </div>
      </div>
    </section>
  );
}
