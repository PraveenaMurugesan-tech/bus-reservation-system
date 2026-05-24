USE bus_reservation;

CREATE OR REPLACE VIEW booking_summary AS
SELECT
    bk.booking_id,
    u.user_id,
    u.name AS user_name,
    u.email AS user_email,
    b.bus_id,
    b.bus_name,
    b.bus_type,
    s.seat_id,
    s.seat_number,
    s.seat_type,
    r.source,
    r.destination,
    r.departure_time,
    r.arrival_time,
    bk.booking_date
FROM bookings bk
JOIN users u ON bk.user_id = u.user_id
JOIN buses b ON bk.bus_id = b.bus_id
JOIN seats s ON bk.seat_id = s.seat_id
JOIN routes r ON b.route_id = r.route_id;
