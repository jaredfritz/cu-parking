import { NextRequest, NextResponse } from 'next/server';
import { scanSchema } from '@/lib/validators';
import { parseQRPayload } from '@/lib/qr/generate';
import type { ScanResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = scanSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validatedData.error.flatten() },
        { status: 400 }
      );
    }

    const { qr_code, lot_id, agent_id } = validatedData.data;

    // Parse QR code
    const parsed = parseQRPayload(qr_code);
    if (!parsed) {
      const response: ScanResponse = {
        success: false,
        status: 'invalid_qr',
        message: 'Invalid QR code format',
      };
      return NextResponse.json(response);
    }

    // TODO: In production:
    // 1. Fetch reservation from database by ID
    // 2. Verify lot_id matches reservation
    // 3. Check if already checked in
    // 4. Call record_check_in RPC

    // Demo: simulate successful check-in
    const response: ScanResponse = {
      success: true,
      status: 'valid',
      message: 'Check-in successful!',
      reservation: {
        id: parsed.reservationId,
        event_id: 'event-1',
        lot_id: lot_id,
        email: 'demo@example.com',
        phone: null,
        license_plate: 'ABC1234',
        payment_source: 'presale',
        amount_cents: 2500,
        stripe_session_id: null,
        stripe_payment_intent_id: null,
        paid_at: new Date().toISOString(),
        qr_code: qr_code,
        check_in_status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        checked_in_by: agent_id || null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        event: {
          id: 'event-1',
          property_id: 'property-1',
          name: 'Illinois vs. UAB',
          event_date: '2026-09-05',
          event_time: '11:00',
          gates_open_time: null,
          presale_cutoff: null,
          in_person_enabled: true,
          is_published: true,
          image_url: null,
          description: 'Season Opener',
          season_id: 'season-2026',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        lot: {
          id: lot_id,
          property_id: 'property-1',
          name: 'Lot C - Assembly Hall',
          capacity: 200,
          price_cents: 2500,
          badges: ['best_value'],
          walking_time_minutes: 12,
          lat: null,
          lng: null,
          description: null,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    );
  }
}
