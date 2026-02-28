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
