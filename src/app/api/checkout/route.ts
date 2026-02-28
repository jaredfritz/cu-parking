import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { checkoutFormSchema } from '@/lib/validators';
import { SEASON_2026_EVENTS } from '@/lib/constants';

// Demo data helpers
function getEventName(eventId: string): string {
  const index = parseInt(eventId.replace('event-', '')) - 1;
  const game = SEASON_2026_EVENTS[index];
  return game ? `Illinois vs. ${game.opponent}` : 'Unknown Event';
}

function getLotInfo(lotId: string): { name: string; price_cents: number } {
  const lots: Record<string, { name: string; price_cents: number }> = {
    'lot-1': { name: 'Lot A - Stadium North', price_cents: 4500 },
    'lot-2': { name: 'Lot B - Stadium East', price_cents: 3500 },
    'lot-3': { name: 'Lot C - Assembly Hall', price_cents: 2500 },
    'lot-4': { name: 'Lot D - Research Park', price_cents: 2000 },
    'lot-5': { name: 'Lot E - State Farm Center', price_cents: 2000 },
    'lot-6': { name: 'Lot F - ADA Accessible', price_cents: 3000 },
  };
  return lots[lotId] || { name: 'Unknown Lot', price_cents: 2000 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { event_id, lot_id, ...formData } = body;

    if (!event_id || !lot_id) {
      return NextResponse.json(
        { error: 'Event ID and Lot ID are required' },
        { status: 400 }
      );
    }

    // Validate form data
    const validatedData = checkoutFormSchema.safeParse(formData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    // Get event and lot info (in production, fetch from database)
    const eventName = getEventName(event_id);
    const lotInfo = getLotInfo(lot_id);

    // TODO: In production:
    // 1. Check presale cutoff
    // 2. Create inventory hold via Supabase RPC
    // 3. Verify spot availability

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      event_id,
      lot_id,
      email: validatedData.data.email,
      phone: validatedData.data.phone,
      license_plate: validatedData.data.license_plate ?? '',
      price_cents: lotInfo.price_cents,
      event_name: eventName,
      lot_name: lotInfo.name,
    });

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
