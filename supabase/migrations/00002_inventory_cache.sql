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
