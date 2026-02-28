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
