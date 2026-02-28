// Core domain types for CU Parking

export type PaymentSource = 'presale' | 'in_person' | 'comp';
export type CheckInStatus = 'pending' | 'checked_in' | 'no_show';

export interface Property {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: string;
  property_id: string;
  name: string;
  capacity: number;
  price_cents: number;
  badges: string[];
  walking_time_minutes: number | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  property_id: string;
  name: string;
  event_date: string;
  event_time: string;
  gates_open_time: string | null;
  presale_cutoff: string | null;
  in_person_enabled: boolean;
  is_published: boolean;
  image_url: string | null;
  description: string | null;
  season_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventLot {
  id: string;
  event_id: string;
  lot_id: string;
  price_override_cents: number | null;
  capacity_override: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  event_id: string;
  lot_id: string;
  email: string;
  phone: string | null;
  license_plate: string;
  payment_source: PaymentSource;
  amount_cents: number;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  qr_code: string;
  check_in_status: CheckInStatus;
  checked_in_at: string | null;
  checked_in_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryCache {
  id: string;
  event_id: string;
  lot_id: string;
  total_capacity: number;
  reserved_count: number;
  checked_in_count: number;
  held_count: number;
  updated_at: string;
}

export interface InventoryHold {
  id: string;
  event_id: string;
  lot_id: string;
  stripe_session_id: string;
  quantity: number;
  expires_at: string;
  released: boolean;
  created_at: string;
}

// Extended types with relations
export interface LotWithInventory extends Lot {
  available_spots: number;
  total_capacity: number;
  reserved_count: number;
}

export interface EventWithLots extends Event {
  lots: LotWithInventory[];
  property: Property;
}

export interface ReservationWithDetails extends Reservation {
  event: Event;
  lot: Lot;
}

// API request/response types
export interface CheckoutRequest {
  event_id: string;
  lot_id: string;
  email: string;
  phone?: string;
  license_plate: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface ScanRequest {
  qr_code: string;
  lot_id: string;
  agent_id?: string;
}

export interface ScanResponse {
  success: boolean;
  status: 'valid' | 'invalid_qr' | 'already_checked_in' | 'wrong_lot' | 'wrong_event';
  message: string;
  reservation?: ReservationWithDetails;
}

export interface LookupRequest {
  event_id: string;
  lot_id?: string;
  query: string; // email or license plate
}

export interface LookupResponse {
  reservations: ReservationWithDetails[];
}

// Form data types
export interface EventFormData {
  name: string;
  event_date: string;
  event_time: string;
  property_id: string;
  presale_cutoff?: string;
  in_person_enabled: boolean;
  is_published: boolean;
  lot_ids: string[];
  image_url?: string;
  description?: string;
}

export interface LotFormData {
  name: string;
  property_id: string;
  capacity: number;
  price_cents: number;
  badges: string[];
  walking_time_minutes?: number;
  lat?: number;
  lng?: number;
  description?: string;
}

// Report types
export interface RevenueReport {
  event_id: string;
  event_name: string;
  event_date: string;
  presale_revenue: number;
  in_person_revenue: number;
  total_revenue: number;
  presale_count: number;
  in_person_count: number;
  checked_in_count: number;
}
