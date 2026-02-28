'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';
import { QRPass } from '@/components/parker/qr-pass';
import { Button } from '@/components/ui/button';
import { SEASON_2026_EVENTS } from '@/lib/constants';

// Get event and lot names from demo data
function getEventName(eventId: string): string {
  const index = parseInt(eventId.replace('event-', '')) - 1;
  const game = SEASON_2026_EVENTS[index];
  return game ? `Illinois vs. ${game.opponent}` : 'Unknown Event';
}

function getEventDate(eventId: string): string {
  const index = parseInt(eventId.replace('event-', '')) - 1;
  const game = SEASON_2026_EVENTS[index];
  return game?.date || '2026-09-05';
}

function getEventTime(eventId: string): string {
  const index = parseInt(eventId.replace('event-', '')) - 1;
  const game = SEASON_2026_EVENTS[index];
  return game?.time || '12:00';
}

function getLotName(lotId: string): string {
  const lots: Record<string, string> = {
    'lot-1': 'Lot A - Stadium North',
    'lot-2': 'Lot B - Stadium East',
    'lot-3': 'Lot C - Assembly Hall',
    'lot-4': 'Lot D - Research Park',
    'lot-5': 'Lot E - State Farm Center',
    'lot-6': 'Lot F - ADA Accessible',
  };
  return lots[lotId] || 'Unknown Lot';
}

export default function PassPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const reservationId = params.reservationId as string;
  const eventId = searchParams.get('event') || 'event-1';
  const lotId = searchParams.get('lot') || 'lot-1';
  const email = searchParams.get('email') || 'user@example.com';
  const licensePlate = searchParams.get('plate') || 'ABC1234';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background">
      {/* Success Banner */}
      <div className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Payment Successful! Your parking pass is ready.</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="max-w-md mx-auto text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">You&apos;re All Set!</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation email to <strong>{email}</strong>.
            Save this page or add to your wallet for easy access on game day.
          </p>
        </div>

        {/* QR Pass */}
        <QRPass
          reservationId={reservationId}
          eventName={getEventName(eventId)}
          eventDate={getEventDate(eventId)}
          eventTime={getEventTime(eventId)}
          lotName={getLotName(lotId)}
          licensePlate={licensePlate}
          email={email}
        />

        {/* Back to home */}
        <div className="max-w-md mx-auto mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Tips */}
        <div className="max-w-md mx-auto mt-12">
          <h2 className="font-semibold mb-4">Game Day Tips</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">1.</span>
              Arrive at least 2 hours before kickoff for the best experience
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">2.</span>
              Have your QR code ready when approaching the gate
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">3.</span>
              Your license plate is a backup - attendants can look you up if needed
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">4.</span>
              Follow signs to your assigned lot for smooth entry
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
