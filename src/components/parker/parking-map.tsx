'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { formatPrice } from '@/lib/constants';

export interface MapLot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price_cents: number;
  isThirdParty?: boolean;
}

interface ParkingMapProps {
  lots: MapLot[];
  stadiumLat: number;
  stadiumLng: number;
  activeLotId?: string | null;
  onLotClick?: (lotId: string) => void;
}

interface MarkerData {
  el: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marker: any; // google.maps.marker.AdvancedMarkerElement
}

export function ParkingMap({
  lots,
  stadiumLat,
  stadiumLng,
  activeLotId,
  onLotClick,
}: ParkingMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null); // google.maps.Map
  const markerMapRef = useRef<Map<string, MarkerData>>(new Map());
  const [zoomLevel, setZoomLevel] = useState(15);

  // Initialize map and markers once on mount
  useEffect(() => {
    if (!mapDivRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

    if (!apiKey || !mapId) {
      console.warn(
        'Google Maps API key or Map ID not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID in .env.local'
      );
      return;
    }

    setOptions({ key: apiKey, v: 'weekly' });

    let cancelled = false;

    (async () => {
      try {
        const mapsLib = await importLibrary('maps');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const markerLib = (await importLibrary('marker')) as any;

        if (cancelled || !mapDivRef.current) return;

        const { Map } = mapsLib;
        const { AdvancedMarkerElement } = markerLib;

        const map = new Map(mapDivRef.current, {
          center: { lat: stadiumLat, lng: stadiumLng },
          zoom: 15,
          mapId,
          disableDefaultUI: true,
          // Note: programmatic styles[] are ignored when mapId is set.
          // Configure the "Muted Tech" palette in Google Cloud Console → Map Styles.
        });

        mapInstanceRef.current = map;

        // Stadium pin — standard teardrop shape with navy fill
        const stadiumEl = document.createElement('div');
        stadiumEl.innerHTML = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10.627 14.222 23.22 15.293 24.18a1 1 0 0 0 1.414 0C17.778 39.22 32 26.627 32 16 32 7.163 24.837 0 16 0z" fill="#1b2b3c"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
        `;
        new AdvancedMarkerElement({
          map,
          position: { lat: stadiumLat, lng: stadiumLng },
          content: stadiumEl,
          title: 'Gies Memorial Stadium',
          zIndex: 20,
        });

        // Lot price-pill markers
        lots.forEach((lot) => {
          const el = document.createElement('div');
          const defaultBg = lot.isThirdParty ? '#9ca3af' : '#1b2b3c';
          el.style.cssText = `
            background:${defaultBg};color:#fff;padding:6px 12px;border-radius:20px;
            min-width:45px;font-family:sans-serif;font-weight:700;font-size:14px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 4px rgba(0,0,0,0.2);cursor:pointer;
            transition:background-color 0.2s ease;white-space:nowrap;
          `;
          el.textContent = lot.isThirdParty ? '$$$' : formatPrice(lot.price_cents);

          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: lot.lat, lng: lot.lng },
            content: el,
            title: lot.name,
            zIndex: 1,
            collisionBehavior: 'REQUIRED_AND_HIDES_OPTIONAL',
          });

          marker.addListener('click', () => onLotClick?.(lot.id));
          markerMapRef.current.set(lot.id, { el, marker });
        });
      } catch (err) {
        console.error('Google Maps failed to load:', err);
      }
    })();

    return () => {
      cancelled = true;
      markerMapRef.current.forEach(({ marker }) => {
        marker.map = null;
      });
      markerMapRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once — lots are stable on mount

  // Update marker active state when activeLotId changes
  useEffect(() => {
    markerMapRef.current.forEach(({ el, marker }, id) => {
      const isActive = id === activeLotId;
      const lot = lots.find((l) => l.id === id);
      const defaultBg = lot?.isThirdParty ? '#9ca3af' : '#1b2b3c';
      const activeBg = lot?.isThirdParty ? '#6b7280' : '#22c55e';
      el.style.backgroundColor = isActive ? activeBg : defaultBg;
      marker.zIndex = isActive ? 10 : 1;
    });

    if (activeLotId && mapInstanceRef.current) {
      const lot = lots.find((l) => l.id === activeLotId);
      if (lot) mapInstanceRef.current.panTo({ lat: lot.lat, lng: lot.lng });
    }
  }, [activeLotId, lots]);

  // Sync explicit zoom changes to map
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoomLevel);
    }
  }, [zoomLevel]);

  const zoomIn = () => setZoomLevel((z) => Math.min(z + 1, 20));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 1, 1));

  return (
    <div className="relative h-full w-full">
      <div ref={mapDivRef} className="h-full w-full" />

      {/* Custom zoom controls — bottom-right overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10,
        }}
      >
        <ZoomButton onClick={zoomIn} label="Zoom in">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </ZoomButton>
        <ZoomButton onClick={zoomOut} label="Zoom out">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </ZoomButton>
      </div>
    </div>
  );
}

function ZoomButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 40,
        width: 40,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: hovered ? '#22c55e' : '#1b2b3c',
        transition: 'color 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}
