from flask import Blueprint, request, jsonify
from models.db import get_connection
from datetime import datetime, timedelta

api = Blueprint("api", __name__)


def execute_query(query, params=None, fetch=False):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    if fetch:
        result = cursor.fetchall()
    else:
        result = None
    cursor.close()
    conn.close()
    return result


def convert_timedelta_to_string(data):
    """Convert timedelta objects to string format for JSON serialization."""
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                for key, value in item.items():
                    if isinstance(value, timedelta):
                        item[key] = str(value)
    elif isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, timedelta):
                data[key] = str(value)
    return data


@api.route("/api/routes", methods=["GET"])
def get_routes():
    routes = execute_query("SELECT * FROM routes ORDER BY route_id", fetch=True)
    routes = convert_timedelta_to_string(routes)
    return jsonify(routes)


@api.route("/api/buses", methods=["GET"])
def get_buses():
    source = request.args.get("source", "").strip()
    destination = request.args.get("destination", "").strip()
    if source and destination:
        query = (
            "SELECT b.*, r.source, r.destination, r.departure_time, r.arrival_time "
            "FROM buses b JOIN routes r ON b.route_id = r.route_id "
            "WHERE r.source LIKE %s AND r.destination LIKE %s"
        )
        buses = execute_query(query, (f"%{source}%", f"%{destination}%"), fetch=True)
    else:
        query = (
            "SELECT b.*, r.source, r.destination, r.departure_time, r.arrival_time "
            "FROM buses b JOIN routes r ON b.route_id = r.route_id"
        )
        buses = execute_query(query, fetch=True)
    buses = convert_timedelta_to_string(buses)
    return jsonify(buses)


@api.route("/api/seats", methods=["GET"])
def get_seats():
    bus_id = request.args.get("bus_id")
    if not bus_id:
        return jsonify({"error": "bus_id is required"}), 400
    seats = execute_query("SELECT * FROM seats WHERE bus_id = %s ORDER BY seat_number", (bus_id,), fetch=True)
    return jsonify(seats)


@api.route("/api/booking-history/<int:user_id>", methods=["GET"])
def booking_history(user_id):
    query = (
        "SELECT bk.booking_id, bk.booking_date, bk.bus_id, bk.seat_id, bk.user_id, u.name AS user_name, "
        "b.bus_name, b.bus_type, b.total_seats, s.seat_number, s.seat_type, s.availability, "
        "r.source, r.destination, r.departure_time, r.arrival_time, p.amount, p.payment_method, p.payment_status "
        "FROM bookings bk "
        "JOIN users u ON bk.user_id = u.user_id "
        "JOIN buses b ON bk.bus_id = b.bus_id "
        "JOIN seats s ON bk.seat_id = s.seat_id "
        "JOIN routes r ON b.route_id = r.route_id "
        "LEFT JOIN payments p ON bk.booking_id = p.booking_id "
        "WHERE bk.user_id = %s ORDER BY bk.booking_date DESC"
    )
    history = execute_query(query, (user_id,), fetch=True)
    history = convert_timedelta_to_string(history)
    return jsonify(history)


@api.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    bus_id = data.get("bus_id")
    seat_id = data.get("seat_id")
    booking_date = data.get("booking_date") or datetime.now().strftime("%Y-%m-%d")

    if not all([user_id, bus_id, seat_id]):
        return jsonify({"error": "user_id, bus_id, and seat_id are required"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO bookings (user_id, bus_id, seat_id, booking_date) VALUES (%s, %s, %s, %s)",
            (user_id, bus_id, seat_id, booking_date),
        )
        booking_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Booking created", "booking_id": booking_id}), 201
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM bookings WHERE booking_id = %s", (booking_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Booking cancelled"}), 200
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/seats/<int:seat_id>", methods=["PUT"])
def update_seat(seat_id):
    data = request.get_json() or {}
    availability = data.get("availability")
    if availability not in ["Available", "Booked"]:
        return jsonify({"error": "availability must be Available or Booked"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE seats SET availability = %s WHERE seat_id = %s",
            (availability, seat_id),
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Seat updated"}), 200
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/register", methods=["POST"])
def register_user():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([name, email, phone, password]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, phone, password) VALUES (%s, %s, %s, %s)",
            (name, email, phone, password),
        )
        user_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Registered successfully", "user_id": user_id}), 201
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/login", methods=["POST"])
def login_user():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    user = execute_query(
        "SELECT user_id, name, email FROM users WHERE email = %s AND password = %s",
        (email, password),
        fetch=True,
    )
    if user:
        return jsonify(user[0])
    return jsonify({"error": "Invalid credentials"}), 401


@api.route("/api/payments", methods=["POST"])
def create_payment():
    data = request.get_json() or {}
    booking_id = data.get("booking_id")
    amount = data.get("amount")
    payment_method = data.get("payment_method")
    payment_status = data.get("payment_status", "Completed")

    if not all([booking_id, amount, payment_method]):
        return jsonify({"error": "booking_id, amount, and payment_method are required"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES (%s, %s, %s, %s)",
            (booking_id, amount, payment_method, payment_status),
        )
        payment_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Payment completed", "payment_id": payment_id}), 201
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/admin/bookings", methods=["GET"])
def admin_bookings():
    bookings = execute_query(
        "SELECT * FROM bookings ORDER BY booking_date DESC", fetch=True
    )
    bookings = convert_timedelta_to_string(bookings)
    return jsonify(bookings)


@api.route("/api/admin/routes", methods=["POST"])
def add_route():
    data = request.get_json() or {}
    source = data.get("source")
    destination = data.get("destination")
    departure_time = data.get("departure_time")
    arrival_time = data.get("arrival_time")
    if not all([source, destination, departure_time, arrival_time]):
        return jsonify({"error": "All route fields are required"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO routes (source, destination, departure_time, arrival_time) VALUES (%s, %s, %s, %s)",
            (source, destination, departure_time, arrival_time),
        )
        route_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Route added", "route_id": route_id}), 201
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/admin/buses", methods=["POST"])
def add_bus():
    data = request.get_json() or {}
    bus_name = data.get("bus_name")
    bus_type = data.get("bus_type")
    total_seats = data.get("total_seats")
    route_id = data.get("route_id")
    if not all([bus_name, bus_type, total_seats, route_id]):
        return jsonify({"error": "All bus fields are required"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO buses (bus_name, bus_type, total_seats, route_id) VALUES (%s, %s, %s, %s)",
            (bus_name, bus_type, total_seats, route_id),
        )
        bus_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Bus added", "bus_id": bus_id}), 201
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


@api.route("/api/admin/seats", methods=["POST"])
def add_seat():
    data = request.get_json() or {}
    bus_id = data.get("bus_id")
    seat_number = data.get("seat_number")
    seat_type = data.get("seat_type")
    availability = data.get("availability", "Available")
    if not all([bus_id, seat_number, seat_type]):
        return jsonify({"error": "All seat fields are required"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO seats (bus_id, seat_number, seat_type, availability) VALUES (%s, %s, %s, %s)",
            (bus_id, seat_number, seat_type, availability),
        )
        seat_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Seat added", "seat_id": seat_id}), 201
    except Exception as ex:
        return jsonify({"error": str(ex)}), 500
