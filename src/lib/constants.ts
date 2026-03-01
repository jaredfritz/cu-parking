// Application constants

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'CU Parking';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Badge display names and colors
export const BADGE_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'easy_exit': { label: 'Easy Exit', variant: 'secondary' },
  'best_value': { label: 'Best Value', variant: 'default' },
  'premium': { label: 'Premium', variant: 'outline' },
  'tailgate': { label: 'Tailgate Friendly', variant: 'secondary' },
  'ada': { label: 'ADA Accessible', variant: 'outline' },
  'rv': { label: 'RV/Oversized', variant: 'outline' },
  'budget': { label: 'Budget', variant: 'secondary' },
};

// 2026 Illinois Football Schedule
export const SEASON_2026_EVENTS = [
  { date: '2026-09-05', opponent: 'UAB', location: 'Champaign, IL', notes: 'Season Opener', time: '11:00' },
  { date: '2026-09-12', opponent: 'Duke', location: 'Champaign, IL', notes: 'Hall of Fame Weekend', time: '14:30' },
  { date: '2026-09-19', opponent: 'Southern Illinois', location: 'Champaign, IL', notes: 'Non-conference Finale', time: '11:00' },
  { date: '2026-09-26', opponent: 'at Ohio State', location: 'Columbus, OH', notes: 'Big Ten Opener', time: '15:30', away: true },
  { date: '2026-10-03', opponent: 'Purdue', location: 'Champaign, IL', notes: 'Homecoming', time: '11:00' },
  { date: '2026-10-10', opponent: 'at Michigan State', location: 'East Lansing, MI', notes: '', time: '12:00', away: true },
  { date: '2026-10-17', opponent: 'BYE', location: '', notes: 'Off Week', time: '', bye: true },
  { date: '2026-10-24', opponent: 'Oregon', location: 'Champaign, IL', notes: 'Foundation Weekend', time: '18:00' },
  { date: '2026-10-31', opponent: 'at Maryland', location: 'College Park, MD', notes: '', time: '12:00', away: true },
  { date: '2026-11-07', opponent: 'Nebraska', location: 'Champaign, IL', notes: 'Dads Day', time: '14:30' },
  { date: '2026-11-14', opponent: 'at UCLA', location: 'Pasadena, CA', notes: '', time: '19:30', away: true },
  { date: '2026-11-21', opponent: 'Iowa', location: 'Champaign, IL', notes: 'Senior Day', time: '11:00' },
  { date: '2026-11-28', opponent: 'at Northwestern', location: 'Evanston, IL', notes: 'Rivalry Game', time: '12:00', away: true },
];

// Gies Memorial Stadium location
export const MEMORIAL_STADIUM = {
  name: 'Gies Memorial Stadium',
  lat: 40.0992,
  lng: -88.2360,
  address: '1402 S 1st St, Champaign, IL 61820',
};

// Price formatting
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

// Date formatting
export function formatEventDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatEventTime(time: string): string {
  if (!time || time === 'TBD') return 'TBD';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
