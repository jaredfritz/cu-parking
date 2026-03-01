export interface StoredEvent {
  id: string;
  opponent: string;
  date: string;
  time: string; // "HH:MM" or "TBD"
  description: string;
  isPublished: boolean;
}

export async function getEvents(): Promise<StoredEvent[]> {
  const res = await fetch('/api/events');
  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? [];
}

export async function getEventById(id: string): Promise<StoredEvent | null> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.event ?? null;
}

export async function addEvent(event: Omit<StoredEvent, 'id'>): Promise<StoredEvent> {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  const data = await res.json();
  return data.event;
}

export async function updateEvent(id: string, event: Partial<StoredEvent>): Promise<void> {
  await fetch(`/api/events/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await fetch(`/api/events/${id}`, { method: 'DELETE' });
}

export function eventName(event: StoredEvent): string {
  return `Illinois vs. ${event.opponent}`;
}
