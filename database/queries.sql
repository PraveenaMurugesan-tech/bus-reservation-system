USE bus_reservation;

-- INSERT sample query
INSERT INTO routes (source, destination, departure_time, arrival_time)
VALUES ('Ahmedabad', 'Surat', '07:30:00', '11:15:00');

-- UPDATE sample query
UPDATE buses
SET total_seats = 45
WHERE bus_id = 1;

-- DELETE sample query
DELETE FROM payments
WHERE payment_id = 5;

-- ALTER TABLE sample query
ALTER TABLE users
ADD COLUMN address VARCHAR(255) NULL;

-- MODIFY COLUMN sample query
ALTER TABLE seats
MODIFY COLUMN seat_type VARCHAR(80) NOT NULL;

-- VIEW query sample
SELECT * FROM booking_summary;
