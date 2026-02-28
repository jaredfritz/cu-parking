export const DEFAULT_THINGS_TO_KNOW = [
  'Pass is valid for this event date only.',
  'Show your digital pass at the lot entrance.',
  'Gates open 3 hours before kickoff.',
  'No in/out privileges.',
];

export interface AdminLot {
  id: string;
  name: string;
  address: string;
  capacity: number;
  price_cents: number;
  walking_time_minutes: number;
  distance_miles: number;
  badges: string[];
  lat: number;
  lng: number;
  isActive: boolean;
  isThirdParty: boolean;
  inPersonEnabled: boolean;
  gatesOpenHours?: number;
  presaleCutoffHours?: number;
  thingsToKnow?: string[];
}

export async function getLots(): Promise<AdminLot[]> {
  const res = await fetch('/api/lots');
  if (!res.ok) return [];
  const data = await res.json();
  return data.lots ?? [];
}

export async function addLot(lot: Omit<AdminLot, 'id'>): Promise<AdminLot> {
  const res = await fetch('/api/lots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lot),
  });
  const data = await res.json();
  return data.lot;
}

export async function updateLot(id: string, lot: Partial<AdminLot>): Promise<void> {
  await fetch(`/api/lots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lot),
  });
}

export async function deleteLot(id: string): Promise<void> {
  await fetch(`/api/lots/${id}`, { method: 'DELETE' });
}
