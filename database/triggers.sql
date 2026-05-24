USE bus_reservation;

DELIMITER $$
CREATE TRIGGER booking_after_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    UPDATE seats
    SET availability = 'Booked'
    WHERE seat_id = NEW.seat_id;
END$$
DELIMITER ;
