-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search on plates/emails

-- Properties (venues/stadiums)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  timezone TEXT DEFAULT 'America/Chicago',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lots (parking areas within properties)
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  walking_time_minutes INTEGER,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (games, concerts, etc.)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  gates_open_time TIME,
  presale_cutoff TIMESTAMPTZ,
  in_person_enabled BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  image_url TEXT,
  description TEXT,
  season_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event-Lot Junction (which lots available for which events)
CREATE TABLE event_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  price_override_cents INTEGER,
  capacity_override INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, lot_id)
);

-- Reservations (bookings)
CREATE TYPE payment_source AS ENUM ('presale', 'in_person', 'comp');
CREATE TYPE check_in_status AS ENUM ('pending', 'checked_in', 'no_show');

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE RESTRICT,
  lot_id UUID REFERENCES lots(id) ON DELETE RESTRICT,

  -- Customer info
  email TEXT NOT NULL,
  phone TEXT,
  license_plate TEXT NOT NULL,

  -- Payment
  payment_source payment_source NOT NULL DEFAULT 'presale',
  amount_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,

  -- QR & Check-in
  qr_code TEXT UNIQUE NOT NULL,
  check_in_status check_in_status DEFAULT 'pending',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reservations_event_id ON reservations(event_id);
CREATE INDEX idx_reservations_lot_id ON reservations(lot_id);
CREATE INDEX idx_reservations_email ON reservations(email);
CREATE INDEX idx_reservations_plate ON reservations(license_plate);
CREATE INDEX idx_reservations_qr ON reservations(qr_code);
CREATE INDEX idx_reservations_stripe_session ON reservations(stripe_session_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_lots_property ON lots(property_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lots_updated_at BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Inventory cache for real-time updates
CREATE TABLE inventory_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  total_capacity INTEGER NOT NULL,
  reserved_count INTEGER DEFAULT 0,
  checked_in_count INTEGER DEFAULT 0,
  held_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, lot_id)
);

-- Temporary holds for checkout sessions
CREATE TABLE inventory_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  released BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_holds_session ON inventory_holds(stripe_session_id);
CREATE INDEX idx_inventory_holds_expiry ON inventory_holds(expires_at) WHERE NOT released;
CREATE INDEX idx_inventory_cache_event_lot ON inventory_cache(event_id, lot_id);

-- Function to get available spots
CREATE OR REPLACE FUNCTION get_available_spots(p_event_id UUID, p_lot_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_cache inventory_cache%ROWTYPE;
  v_active_holds INTEGER;
BEGIN
  SELECT * INTO v_cache FROM inventory_cache
  WHERE event_id = p_event_id AND lot_id = p_lot_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(quantity), 0) INTO v_active_holds
  FROM inventory_holds
  WHERE event_id = p_event_id
    AND lot_id = p_lot_id
    AND NOT released
    AND expires_at > NOW();

  RETURN GREATEST(0, v_cache.total_capacity - v_cache.reserved_count - v_active_holds);
END;
$$ LANGUAGE plpgsql;

-- Function to create a hold
CREATE OR REPLACE FUNCTION create_inventory_hold(
  p_event_id UUID,
  p_lot_id UUID,
  p_stripe_session_id TEXT,
  p_hold_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  PERFORM * FROM inventory_cache
  WHERE event_id = p_event_id AND lot_id = p_lot_id
  FOR UPDATE;

  v_available := get_available_spots(p_event_id, p_lot_id);

  IF v_available < 1 THEN
    RETURN FALSE;
  END IF;

  INSERT INTO inventory_holds (event_id, lot_id, stripe_session_id, expires_at)
  VALUES (p_event_id, p_lot_id, p_stripe_session_id, NOW() + (p_hold_minutes || ' minutes')::INTERVAL);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to finalize reservation (called after payment)
CREATE OR REPLACE FUNCTION finalize_reservation(p_stripe_session_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_hold inventory_holds%ROWTYPE;
BEGIN
  UPDATE inventory_holds
  SET released = true
  WHERE stripe_session_id = p_stripe_session_id AND NOT released
  RETURNING * INTO v_hold;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE inventory_cache
  SET reserved_count = reserved_count + v_hold.quantity,
      updated_at = NOW()
  WHERE event_id = v_hold.event_id AND lot_id = v_hold.lot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired holds
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS void AS $$
BEGIN
  UPDATE inventory_holds
  SET released = true
  WHERE expires_at < NOW() AND NOT released;
END;
$$ LANGUAGE plpgsql;
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_holds ENABLE ROW LEVEL SECURITY;

-- Public read access for published events and active lots
CREATE POLICY "Public can view published events" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view active lots" ON lots
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Public can view event_lots" ON event_lots
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view inventory" ON inventory_cache
  FOR SELECT USING (true);

-- Reservations: allow public read (QR code acts as auth token)
CREATE POLICY "Anyone can view reservations" ON reservations
  FOR SELECT USING (true);

-- Allow inserts from service role (handled by API routes)
-- Service role bypasses RLS by default
-- Function to initialize inventory when event_lots are created
CREATE OR REPLACE FUNCTION init_event_lot_inventory()
RETURNS TRIGGER AS $$
DECLARE
  v_capacity INTEGER;
BEGIN
  SELECT COALESCE(NEW.capacity_override, lots.capacity)
  INTO v_capacity
  FROM lots WHERE id = NEW.lot_id;

  INSERT INTO inventory_cache (event_id, lot_id, total_capacity)
  VALUES (NEW.event_id, NEW.lot_id, v_capacity)
  ON CONFLICT (event_id, lot_id)
  DO UPDATE SET total_capacity = v_capacity, updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_lots_init_inventory
  AFTER INSERT ON event_lots
  FOR EACH ROW EXECUTE FUNCTION init_event_lot_inventory();

-- Function to increment check-in count
CREATE OR REPLACE FUNCTION record_check_in(p_reservation_id UUID, p_agent_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_reservation reservations%ROWTYPE;
BEGIN
  UPDATE reservations
  SET check_in_status = 'checked_in',
      checked_in_at = NOW(),
      checked_in_by = p_agent_id
  WHERE id = p_reservation_id AND check_in_status = 'pending'
  RETURNING * INTO v_reservation;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE inventory_cache
  SET checked_in_count = checked_in_count + 1,
      updated_at = NOW()
  WHERE event_id = v_reservation.event_id AND lot_id = v_reservation.lot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View for real-time inventory with available spots calculation
CREATE OR REPLACE VIEW inventory_realtime AS
SELECT
  ic.event_id,
  ic.lot_id,
  ic.total_capacity,
  ic.reserved_count,
  ic.checked_in_count,
  get_available_spots(ic.event_id, ic.lot_id) as available_spots,
  ic.updated_at
FROM inventory_cache ic;

-- Function to get event with lot availability
CREATE OR REPLACE FUNCTION get_event_with_lots(p_event_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  event_date DATE,
  event_time TIME,
  lot_id UUID,
  lot_name TEXT,
  price_cents INTEGER,
  badges TEXT[],
  walking_time_minutes INTEGER,
  lat DECIMAL,
  lng DECIMAL,
  total_capacity INTEGER,
  available_spots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as event_id,
    e.name as event_name,
    e.event_date,
    e.event_time,
    l.id as lot_id,
    l.name as lot_name,
    COALESCE(el.price_override_cents, l.price_cents) as price_cents,
    l.badges,
    l.walking_time_minutes,
    l.lat,
    l.lng,
    ic.total_capacity,
    get_available_spots(e.id, l.id) as available_spots
  FROM events e
  JOIN event_lots el ON e.id = el.event_id AND el.is_active = true
  JOIN lots l ON el.lot_id = l.id AND l.is_active = true
  LEFT JOIN inventory_cache ic ON e.id = ic.event_id AND l.id = ic.lot_id
  WHERE e.id = p_event_id AND e.is_published = true;
END;
$$ LANGUAGE plpgsql;
-- Seed data for CU Parking MVP
-- Run this after migrations to populate demo data

-- Insert Memorial Stadium property
INSERT INTO properties (id, name, address, city, state, zip, lat, lng, timezone)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Memorial Stadium',
  '1402 S 1st St',
  'Champaign',
  'IL',
  '61820',
  40.0992,
  -88.2360,
  'America/Chicago'
);

-- Insert parking lots
INSERT INTO lots (id, property_id, name, capacity, price_cents, badges, walking_time_minutes, lat, lng, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Lot A - Stadium North', 100, 4500, ARRAY['premium', 'easy_exit'], 5, 40.1012, -88.2350, 1),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Lot B - Stadium East', 150, 3500, ARRAY['easy_exit'], 8, 40.0982, -88.2330, 2),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Lot C - Assembly Hall', 200, 2500, ARRAY['best_value'], 12, 40.0960, -88.2380, 3),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Lot D - Research Park', 300, 2000, ARRAY['best_value', 'tailgate'], 18, 40.0920, -88.2400, 4),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Lot E - State Farm Center', 250, 2000, ARRAY['tailgate'], 15, 40.0940, -88.2320, 5),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Lot F - ADA Accessible', 50, 3000, ARRAY['ada', 'premium'], 3, 40.1000, -88.2370, 6);

-- Insert 2026 season events (home games only)
INSERT INTO events (id, property_id, name, event_date, event_time, in_person_enabled, is_published, description) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. UAB', '2026-09-05', '11:00', true, true, 'Season Opener'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. Duke', '2026-09-12', '14:30', true, true, 'Hall of Fame Weekend'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. Southern Illinois', '2026-09-19', '11:00', true, true, 'Non-conference Finale'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. Purdue', '2026-10-03', '11:00', true, true, 'Homecoming'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. Oregon', '2026-10-24', '18:00', true, true, 'Foundation Weekend'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. Nebraska', '2026-11-07', '14:30', true, true, 'Dads Day'),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Illinois vs. Iowa', '2026-11-21', '11:00', true, true, 'Senior Day');

-- Link events to lots
INSERT INTO event_lots (event_id, lot_id) VALUES
-- UAB game
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006'),
-- Duke game
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006'),
-- Southern Illinois game
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006'),
-- Purdue (Homecoming)
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006'),
-- Oregon
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006'),
-- Nebraska (Dads Day)
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006'),
-- Iowa (Senior Day)
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000006');

-- Note: inventory_cache will be auto-populated by the trigger on event_lots
