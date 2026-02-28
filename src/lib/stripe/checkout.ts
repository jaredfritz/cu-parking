import { getStripe } from './client';
import type { CheckoutRequest } from '@/types';

interface CreateCheckoutSessionParams extends CheckoutRequest {
  price_cents: number;
  event_name: string;
  lot_name: string;
}

export async function createCheckoutSession({
  event_id,
  lot_id,
  email,
  phone,
  license_plate,
  price_cents,
  event_name,
  lot_name,
}: CreateCheckoutSessionParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Parking - ${lot_name}`,
            description: `${event_name} at Memorial Stadium`,
          },
          unit_amount: price_cents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      event_id,
      lot_id,
      email,
      phone: phone || '',
      license_plate,
    },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/events/${event_id}/checkout?lot=${lot_id}&cancelled=true`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  });

  return session;
}

export async function retrieveCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}
