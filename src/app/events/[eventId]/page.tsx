'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, PersonStanding, X, ShieldCheck, RotateCcw, Info, XCircle } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { LotList } from '@/components/parker/lot-list';
import { Button } from '@/components/ui/button';
import { formatEventDate, formatEventTime, formatPrice, MEMORIAL_STADIUM } from '@/lib/constants';
import { getLots, DEFAULT_THINGS_TO_KNOW } from '@/lib/lots-store';
import { getEventById as getStoredEventById, eventName } from '@/lib/events-store';
import type { Event } from '@/types';
import type { LotCardData } from '@/components/parker/lot-card';
import type { MapLot } from '@/components/parker/parking-map';

// Dynamic import — Google Maps needs window
const ParkingMap = dynamic(
  () => import('@/components/parker/parking-map').then((m) => m.ParkingMap),
  { ssr: false }
);

function LotDetailPanel({
  lot,
  eventId,
  onClose,
}: {
  lot: LotCardData;
  eventId: string;
  onClose: () => void;
}) {
  const isThirdParty = lot.isThirdParty ?? false;
  const filledPct = Math.round(((lot.total_capacity - lot.available_spots) / lot.total_capacity) * 100);

  return (
    <div className="w-[340px] flex-shrink-0 bg-white border-r border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-base text-gray-900 leading-snug">{lot.name}</h2>
          {lot.address && <p className="text-xs text-gray-500 mt-0.5">{lot.address}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 -mr-1 flex-shrink-0">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Lot photo placeholder */}
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
        Lot Photo
      </div>

      {/* Price + book */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-end justify-between mb-3">
          <div>
            {isThirdParty ? (
              <>
                <p className="text-2xl font-bold text-gray-400">$$$</p>
                <p className="text-xs text-gray-400">varies by operator</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(lot.price_cents)}</p>
                <p className="text-xs text-gray-400">per vehicle</p>
              </>
            )}
          </div>
          {isThirdParty ? (
            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded">In-Person Only</span>
          ) : lot.available_spots === 0 ? (
            <span className="text-sm text-gray-400 font-medium">Sold Out</span>
          ) : (
            <Link href={`/events/${eventId}/checkout?lot=${lot.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6">
                Book Now
              </Button>
            </Link>
          )}
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          {isThirdParty ? (
            <>
              <span className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-500" /> In-Person Only
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-500" /> Not Guaranteed
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Free Cancellation
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-green-600" /> Guaranteed Spot
              </span>
            </>
          )}
        </div>
      </div>

      {/* Walk info */}
      {lot.walking_time_minutes && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <PersonStanding className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>
              {lot.walking_time_minutes} min walk
              {lot.distance_miles !== undefined ? ` · ${lot.distance_miles} mi` : ''}
            </span>
          </div>
          {lot.address && <p className="text-xs text-gray-500 mt-1">{lot.address}</p>}
        </div>
      )}

      {/* Availability bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Availability</span>
          <span className={lot.available_spots <= 10 ? 'text-amber-600 font-semibold' : ''}>
            {lot.available_spots} spots left
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${filledPct}%` }}
          />
        </div>
      </div>

      {/* Things to know */}
      {(() => {
        const items = lot.thingsToKnow ?? DEFAULT_THINGS_TO_KNOW;
        if (items.length === 0) return null;
        return (
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Things to Know</p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [detailLotId, setDetailLotId] = useState<string | null>(null);
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [lots, setLots] = useState<LotCardData[]>([]);

  useEffect(() => {
    async function load() {
      const [storedEvent, allLots] = await Promise.all([
        getStoredEventById(eventId),
        getLots(),
      ]);

      if (!storedEvent || storedEvent.isBye || storedEvent.isAway) {
        setEvent(null);
      } else {
        setEvent({
          id: storedEvent.id,
          property_id: 'property-1',
          name: eventName(storedEvent),
          event_date: storedEvent.date,
          event_time: storedEvent.time,
          gates_open_time: null,
          presale_cutoff: null,
          in_person_enabled: true,
          is_published: storedEvent.isPublished,
          image_url: null,
          description: storedEvent.description || null,
          season_id: 'season-2026',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      setLots(
        allLots.filter((l) => l.isActive).map((l, index) => {
          const reserved = Math.floor(l.capacity * 0.6);
          const available = l.capacity - reserved;
          return {
            id: l.id,
            property_id: 'property-1',
            name: l.name,
            address: l.address,
            price_cents: l.price_cents,
            walking_time_minutes: l.walking_time_minutes,
            distance_miles: l.distance_miles,
            badges: l.badges,
            isThirdParty: l.isThirdParty,
            thingsToKnow: l.thingsToKnow,
            lat: l.lat,
            lng: l.lng,
            capacity: l.capacity,
            available_spots: available,
            total_capacity: l.capacity,
            reserved_count: reserved,
            description: null,
            is_active: l.isActive,
            sort_order: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        })
      );
    }
    load();
  }, [eventId]);

  const activeLotId = hoveredLotId ?? detailLotId;
  const detailLot = lots.find((l) => l.id === detailLotId) ?? null;

  const mapLots: MapLot[] = lots
    .filter((l) => l.lat != null && l.lng != null)
    .map((l) => ({
      id: l.id,
      name: l.name,
      lat: l.lat!,
      lng: l.lng!,
      price_cents: l.price_cents,
      isThirdParty: l.isThirdParty,
    }));

  if (event === undefined) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <Link href="/" className="text-primary hover:underline">
              ← Back to Events
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      {/* Slim event info bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-6 flex-wrap">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 flex-shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Events
          </Link>
          <h1 className="font-bold text-sm text-gray-900">{event.name}</h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatEventDate(event.event_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatEventTime(event.event_time)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              Gies Memorial Stadium, Champaign
            </span>
          </div>
        </div>
      </div>

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: lot list */}
        <div className="w-[28%] min-w-[260px] max-w-[360px] overflow-y-auto bg-gray-50 p-3 flex-shrink-0">
          <LotList
            lots={lots}
            eventId={eventId}
            activeLotId={activeLotId}
            onDetailsClick={(id) => setDetailLotId(id === detailLotId ? null : id)}
            onHover={setHoveredLotId}
          />
        </div>

        {/* Middle: detail panel (conditional) */}
        {detailLot && (
          <LotDetailPanel
            lot={detailLot}
            eventId={eventId}
            onClose={() => setDetailLotId(null)}
          />
        )}

        {/* Right: map */}
        <div className="flex-1 hidden md:block">
          <ParkingMap
            lots={mapLots}
            stadiumLat={MEMORIAL_STADIUM.lat}
            stadiumLng={MEMORIAL_STADIUM.lng}
            activeLotId={activeLotId}
            onLotClick={(id) => setDetailLotId(id === detailLotId ? null : id)}
          />
        </div>
      </div>
    </div>
  );
}
