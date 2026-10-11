# 🚌 Bus Reservation System

A **Bus Reservation System** is a database-driven application designed to simplify and automate the process of searching for buses, checking seat availability, reserving seats, and managing passenger and booking information.

The system provides an easy-to-use platform for passengers to find suitable buses based on their **source, destination, date, and timing**, while allowing administrators to efficiently manage buses, routes, schedules, seats, and reservations.

## ✨ Features

* 🔐 User registration and login
* 🚌 Search buses by source and destination
* 📅 Search buses based on travel date
* 💺 Check real-time seat availability
* 🎟️ Book and cancel tickets
* 👤 Manage passenger details
* 📋 View booking history
* 🚌 Manage bus and route information
* 👨‍💼 Admin management system
* 🗄️ Database-based reservation management

## 🎯 Objective

The main objective of this project is to develop an efficient and reliable system that **automates the bus booking pr**
# Bus Reservation System

A full-stack web application for bus reservation built with HTML, CSS, JavaScript, Python Flask, and MySQL/Postgres.

## Folder 

- `database/`
  - `schema.sql` - database and table schema
  - `sample_data.sql` - sample records for users, routes, buses, seats, bookings, payments
  - `queries.sql` - example SQL commands for INSERT, UPDATE, DELETE, ALTER, MODIFY, VIEW
  - `triggers.sql` - trigger to update seat availability after booking insertion
  - `views.sql` - view creation for booking summary
- `backend/`
  - `app.py` - Flask API server
  - `models/db.py` - MySQL connection logic
  - `routes/api_routes.py` - REST API routes
  - `requirements.txt` - Python dependencies
- `frontend/`
  - `index.html` - homepage
  - `login.html` - user login
  - `register.html` - user registration
  - `booking.html` - search, select and book seats
  - `payment.html` - payment page
  - `admin.html` - admin dashboard for CRUD operations
  - `style.css` - shared styling
  - `script.js` - frontend logic and fetch API integration

## Setup Instructions

1. Install MySQL locally.
2. Open MySQL command line or MySQL Workbench :
   ```sql
   SOURCE path/to/database/schema.sql;
   SOURCE path/to/database/triggers.sql;
   SOURCE path/to/database/sample_data.sql;
   SOURCE path/to/database/views.sql;
   ```
3. Update `backend/models/db.py` with your MySQL credentials if needed.
4. Create a Python virtual environment and install requirements:
   ```bash
   cd bus-reservation-system
   python -m venv venv
   venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
   ```bash
   python backend/app.py
   ```
6. Open the frontend files in your browser. For best results, serve the `frontend` folder via a static server or VS Code Live Server.

## Features

- User registration and login
- Display and search available buses by source and destination
- Seat availability display and booking
- Payment processing for a booking
- Booking history view
- Admin dashboard for managing routes, buses, seats, and bookings
- MySQL triggers

## API Endpoints

- `GET /api/routes`
- `GET /api/buses`
- `GET /api/seats?bus_id={bus_id}`
- `POST /api/register`
- `POST /api/login`
- `POST /api/bookings`
- `DELETE /api/bookings/{booking_id}`
- `PUT /api/seats/{seat_id}`
- `GET /api/booking-history/{user_id}`
- `POST /api/payments`
- `POST /api/admin/routes`
- `POST /api/admin/buses`
- `POST /api/admin/seats`
- `GET /api/admin/bookings`

## Notes

- Ensure the backend is running before using the frontend.
- The admin page includes create, read, update, and delete actions.
- The `booking_summary` view joins users, buses, bookings, and seats for reporting.
- The trigger automatically marks a seat as `Booked` whenever a booking is inserted.
