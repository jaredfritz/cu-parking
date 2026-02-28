import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { AdminLot } from '@/lib/lots-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToLot(row: any): AdminLot {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? '',
    capacity: row.capacity ?? 0,
    price_cents: row.price_cents ?? 0,
    walking_time_minutes: row.walking_time_minutes ?? 0,
    distance_miles: row.distance_miles ?? 0,
    badges: row.badges ?? [],
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    isActive: row.is_active ?? true,
    isThirdParty: row.is_third_party ?? false,
    inPersonEnabled: row.in_person_enabled ?? true,
    gatesOpenHours: row.gates_open_hours ?? undefined,
    presaleCutoffHours: row.presale_cutoff_hours ?? undefined,
    thingsToKnow: row.things_to_know ?? undefined,
  };
}

function lotToDb(lot: Partial<AdminLot>): Record<string, unknown> {
  const r: Record<string, unknown> = {};
  if (lot.name !== undefined) r.name = lot.name;
  if (lot.address !== undefined) r.address = lot.address;
  if (lot.capacity !== undefined) r.capacity = lot.capacity;
  if (lot.price_cents !== undefined) r.price_cents = lot.price_cents;
  if (lot.walking_time_minutes !== undefined) r.walking_time_minutes = lot.walking_time_minutes;
  if (lot.distance_miles !== undefined) r.distance_miles = lot.distance_miles;
  if (lot.badges !== undefined) r.badges = lot.badges;
  if (lot.lat !== undefined) r.lat = lot.lat;
  if (lot.lng !== undefined) r.lng = lot.lng;
  if (lot.isActive !== undefined) r.is_active = lot.isActive;
  if (lot.isThirdParty !== undefined) r.is_third_party = lot.isThirdParty;
  if (lot.inPersonEnabled !== undefined) r.in_person_enabled = lot.inPersonEnabled;
  if (lot.gatesOpenHours !== undefined) r.gates_open_hours = lot.gatesOpenHours;
  if (lot.presaleCutoffHours !== undefined) r.presale_cutoff_hours = lot.presaleCutoffHours;
  if (lot.thingsToKnow !== undefined) r.things_to_know = lot.thingsToKnow;
  return r;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('lots').select('*').eq('id', lotId).single();

  if (error) return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
  return NextResponse.json({ lot: dbToLot(data) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('lots')
    .update({ ...lotToDb(body), updated_at: new Date().toISOString() })
    .eq('id', lotId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lot: dbToLot(data) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  const { lotId } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('lots').delete().eq('id', lotId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
