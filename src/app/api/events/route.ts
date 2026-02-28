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

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: (data ?? []).map(dbToEvent) });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Partial<StoredEvent>;
  const supabase = getSupabaseAdmin();
  const id = `event-${Date.now()}`;

  const { data, error } = await supabase
    .from('events')
    .insert({
      id,
      opponent: body.opponent,
      date: body.date,
      time: body.time ?? '12:00',
      description: body.description ?? '',
      is_published: body.isPublished ?? false,
      is_away: body.isAway ?? false,
      is_bye: body.isBye ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: dbToEvent(data) }, { status: 201 });
}
