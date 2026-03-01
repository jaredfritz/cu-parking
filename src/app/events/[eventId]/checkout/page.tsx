'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Shield, CheckCircle } from 'lucide-react';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { CheckoutForm } from '@/components/parker/checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatEventDate, formatEventTime, formatPrice } from '@/lib/constants';
import { getEventById as getStoredEventById, eventName } from '@/lib/events-store';
import { getLots } from '@/lib/lots-store';
import type { CheckoutFormValues } from '@/lib/validators';
import type { Event, Lot } from '@/types';
import { toast } from 'sonner';

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = params.eventId as string;
  const lotId = searchParams.get('lot');

  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [lot, setLot] = useState<Lot | null | undefined>(undefined);

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

      if (lotId) {
        const found = allLots.find((l) => l.id === lotId);
        if (found) {
          setLot({
            id: found.id,
            property_id: 'property-1',
            name: found.name,
            capacity: found.capacity,
            price_cents: found.price_cents,
            badges: found.badges,
            walking_time_minutes: found.walking_time_minutes,
            lat: found.lat,
            lng: found.lng,
            description: null,
            is_active: found.isActive,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setLot(null);
        }
      } else {
        setLot(null);
      }
    }
    load();
  }, [eventId, lotId]);

  if (event === undefined || lot === undefined) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event || !lot) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Selection</h1>
            <p className="text-muted-foreground mb-8">
              Please select a valid event and parking lot.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCheckout = async (data: CheckoutFormValues) => {
    console.log('Checkout data:', { eventId, lotId, ...data });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const reservationId = `res-${Date.now()}`;
    toast.success('Payment successful!', {
      description: 'Redirecting to your parking pass...',
    });
    router.push(`/pass/${reservationId}?event=${eventId}&lot=${lotId}&email=${encodeURIComponent(data.email)}&plate=${data.license_plate}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lot Selection
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Purchase</CardTitle>
                </CardHeader>
                <CardContent>
                  <CheckoutForm
                    eventId={eventId}
                    lotId={lot.id}
                    price={lot.price_cents}
                    onSubmit={handleCheckout}
                  />
                </CardContent>
              </Card>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
                  <Shield className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">256-bit encryption</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm font-medium">Instant Confirmation</p>
                  <p className="text-xs text-muted-foreground">Digital pass via email</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-background">
                  <Calendar className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm font-medium">Event Day Access</p>
                  <p className="text-xs text-muted-foreground">Show QR at gate</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Event</p>
                    <p className="font-medium">{event.name}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatEventDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatEventTime(event.event_time)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Gies Memorial Stadium, Champaign</span>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Parking Lot</p>
                    <p className="font-medium">{lot.name}</p>
                    {lot.walking_time_minutes && (
                      <p className="text-sm text-muted-foreground">
                        {lot.walking_time_minutes} min walk to stadium
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Parking (1 spot)</span>
                      <span>{formatPrice(lot.price_cents)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Service Fee</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(lot.price_cents)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
