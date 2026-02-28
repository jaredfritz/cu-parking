import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { v4 as uuidv4 } from 'uuid';

// Disable body parsing for raw webhook payload
export const runtime = 'nodejs';

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { event_id, lot_id, email, phone, license_plate } = session.metadata || {};

  if (!event_id || !lot_id || !email || !license_plate) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Generate reservation data
  const reservationId = uuidv4();
  const qrCode = `CUP:${reservationId}:${uuidv4().slice(0, 8).toUpperCase()}`;

  console.log('Creating reservation:', {
    reservationId,
    event_id,
    lot_id,
    email,
    license_plate,
    qrCode,
  });

  // TODO: In production:
  // 1. Call finalize_reservation RPC to release hold and update inventory
  // 2. Create reservation record in database
  // 3. Send confirmation email via Postmark
  // 4. Send SMS reminder via Twilio (if phone provided)

  // For now, just log the success
  console.log('Reservation created successfully:', reservationId);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  // Inventory hold auto-expires via database function
  // Just log for analytics
  console.log('Checkout session expired:', session.id);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'checkout.session.expired':
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
