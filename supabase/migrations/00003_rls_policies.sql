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
