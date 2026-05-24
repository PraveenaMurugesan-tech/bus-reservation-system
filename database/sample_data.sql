USE bus_reservation;

-- Users sample data
INSERT INTO users (name, email, phone, password) VALUES
('Aditi Sharma', 'aditi.sharma@example.com', '+91-9876543210', 'password123'),
('Rohan Mehta', 'rohan.mehta@example.com', '+91-9123456780', 'rohan2024'),
('Priya Patel', 'priya.patel@example.com', '+91-9988776655', 'priyaPass'),
('Karan Singh', 'karan.singh@example.com', '+91-9012345678', 'karanSecure'),
('Neha Verma', 'neha.verma@example.com', '+91-9567890123', 'nehaRide');

-- Routes sample data
INSERT INTO routes (source, destination, departure_time, arrival_time) VALUES
('Delhi', 'Jaipur', '08:00:00', '12:30:00'),
('Mumbai', 'Pune', '09:00:00', '12:00:00'),
('Bangalore', 'Chennai', '07:00:00', '13:00:00'),
('Kolkata', 'Bhubaneswar', '10:00:00', '14:30:00'),
('Hyderabad', 'Vijayawada', '06:30:00', '10:45:00');

-- Buses sample data
INSERT INTO buses (bus_name, bus_type, total_seats, route_id) VALUES
('Royal Express', 'AC Sleeper', 40, 1),
('City Rider', 'Semi-Sleeper', 35, 2),
('South Star', 'AC Seater', 42, 3),
('Eastern Comfort', 'Non-AC Seater', 38, 4),
('Telangana Cruiser', 'AC Seater', 40, 5);

-- Seats sample data
INSERT INTO seats (bus_id, seat_number, seat_type, availability) VALUES
(1, '1A', 'Window', 'Available'),
(1, '1B', 'Aisle', 'Available'),
(1, '2A', 'Window', 'Available'),
(1, '2B', 'Aisle', 'Available'),
(1, '3A', 'Window', 'Available'),
(2, '1A', 'Window', 'Available'),
(2, '1B', 'Aisle', 'Available'),
(2, '2A', 'Window', 'Available'),
(2, '2B', 'Aisle', 'Available'),
(2, '3A', 'Window', 'Available'),
(3, '1A', 'Window', 'Available'),
(3, '1B', 'Aisle', 'Available'),
(3, '2A', 'Window', 'Available'),
(3, '2B', 'Aisle', 'Available'),
(3, '3A', 'Window', 'Available'),
(4, '1A', 'Window', 'Available'),
(4, '1B', 'Aisle', 'Available'),
(4, '2A', 'Window', 'Available'),
(4, '2B', 'Aisle', 'Available'),
(4, '3A', 'Window', 'Available'),
(5, '1A', 'Window', 'Available'),
(5, '1B', 'Aisle', 'Available'),
(5, '2A', 'Window', 'Available'),
(5, '2B', 'Aisle', 'Available'),
(5, '3A', 'Window', 'Available');

-- Bookings sample data
INSERT INTO bookings (user_id, bus_id, seat_id, booking_date) VALUES
(1, 1, 1, '2024-06-01'),
(2, 2, 6, '2024-06-04'),
(3, 3, 11, '2024-06-08'),
(4, 4, 16, '2024-06-12'),
(5, 5, 21, '2024-06-15');

-- Payments sample data
INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES
(1, 1200.00, 'Credit Card', 'Completed'),
(2, 850.00, 'UPI', 'Completed'),
(3, 1450.00, 'Debit Card', 'Completed'),
(4, 700.00, 'Net Banking', 'Completed'),
(5, 980.00, 'Wallet', 'Completed');
