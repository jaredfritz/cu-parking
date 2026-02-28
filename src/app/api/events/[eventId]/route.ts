import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { StoredEvent } from '@/lib/events-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToEvent(row: any): StoredEvent {
  return {
    id: row.id,
    opponent: row.opponent,
    date: row.date,
    time: row.time ?? '12:00',
    description: row.description ?? '',
    isPublished: row.is_published ?? false,
    isAway: row.is_away ?? false,
    isBye: row.is_bye ?? false,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();

  if (error) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({ event: dbToEvent(data) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const body = await request.json() as Partial<StoredEvent>;
  const supabase = getSupabaseAdmin();

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.opponent !== undefined) update.opponent = body.opponent;
  if (body.date !== undefined) update.date = body.date;
  if (body.time !== undefined) update.time = body.time;
  if (body.description !== undefined) update.description = body.description;
  if (body.isPublished !== undefined) update.is_published = body.isPublished;
  if (body.isAway !== undefined) update.is_away = body.isAway;
  if (body.isBye !== undefined) update.is_bye = body.isBye;

  const { data, error } = await supabase
    .from('events')
    .update(update)
    .eq('id', eventId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: dbToEvent(data) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
