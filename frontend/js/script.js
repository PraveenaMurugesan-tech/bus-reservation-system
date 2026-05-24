const apiBase = "http://127.0.0.1:5000";

async function fetchJSON(path, options = {}) {
    try {
        const response = await fetch(`${apiBase}${path}`, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

function getUser() {
    return JSON.parse(localStorage.getItem("busUser") || "null");
}

function setUser(user) {
    localStorage.setItem("busUser", JSON.stringify(user));
}

function showMessage(elementId, text, error = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("error", error);
    el.classList.toggle("success", !error && text.length > 0);
}

function requireLogin() {
    if (!getUser()) {
        window.location.href = "login.html";
    }
}

function getBusImage(type) {
    const imageMap = {
        "AC Sleeper": "assets/images/ac-sleeper.svg",
        "Volvo": "assets/images/volvo.svg",
        "Luxury Bus": "assets/images/luxury-bus.svg",
        "Express Bus": "assets/images/express-bus.svg",
        "Semi Sleeper": "assets/images/semi-sleeper.svg",
    };
    return imageMap[type] || "assets/images/express-bus.svg";
}

function saveSearchFilters(filters) {
    localStorage.setItem("busSearchFilters", JSON.stringify(filters));
}

function getSearchFilters() {
    return JSON.parse(localStorage.getItem("busSearchFilters") || "null");
}

function clearSearchFilters() {
    localStorage.removeItem("busSearchFilters");
}

function toggleDarkMode() {
    const enabled = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode", enabled);
    localStorage.setItem("darkMode", enabled);
}

function applyDarkMode() {
    const active = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", active);
    const toggle = document.getElementById("dark-mode-toggle");
    if (toggle) {
        toggle.innerHTML = active ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

function initPage() {
    const page = document.body.id;
    applyDarkMode();
    const toggle = document.getElementById("dark-mode-toggle");
    if (toggle) {
        toggle.addEventListener("click", toggleDarkMode);
    }
    if (page === "home-page") setupHomePage();
    if (page === "login-page") setupLoginPage();
    if (page === "register-page") setupRegisterPage();
    if (page === "booking-page") setupBookingPage();
    if (page === "payment-page") setupPaymentPage();
    if (page === "admin-page") setupAdminPage();
}

function renderRouteOptions(routes, sourceSelect, destinationSelect) {
    if (!routes || !routes.length) return;
    const uniqueSources = [...new Set(routes.map((route) => route.source))];
    const uniqueDestinations = [...new Set(routes.map((route) => route.destination))];
    sourceSelect.innerHTML = "";
    destinationSelect.innerHTML = "";

    const sourceBlank = document.createElement("option");
    sourceBlank.value = "";
    sourceBlank.textContent = "Select source";
    sourceSelect.appendChild(sourceBlank);

    const destBlank = document.createElement("option");
    destBlank.value = "";
    destBlank.textContent = "Select destination";
    destinationSelect.appendChild(destBlank);

    uniqueSources.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        sourceSelect.appendChild(option);
    });
    uniqueDestinations.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        destinationSelect.appendChild(option);
    });
}

async function setupHomePage() {
    const sourceSelect = document.getElementById("home-search-source");
    const destinationSelect = document.getElementById("home-search-destination");
    const form = document.getElementById("home-search-form");
    const messageId = "home-search-message";

    try {
        const routes = await fetchJSON("/api/routes");
        renderRouteOptions(routes, sourceSelect, destinationSelect);
    } catch (error) {
        showMessage(messageId, "Unable to load routes. Try again later.", true);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const source = sourceSelect.value;
        const destination = destinationSelect.value;
        const date = document.getElementById("home-search-date").value;
        const type = document.getElementById("home-search-type").value;

        if (!source || !destination) {
            showMessage(messageId, "Please select both source and destination.", true);
            return;
        }

        saveSearchFilters({ source, destination, date, type });
        window.location.href = "booking.html";
    });
}

async function setupLoginPage() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!email || !password) {
            showMessage("login-message", "Email and password are required.", true);
            return;
        }

        try {
            const result = await fetchJSON("/api/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            if (result.user_id) {
                setUser(result);
                showMessage("login-message", "Login successful. Redirecting...", false);
                setTimeout(() => (window.location.href = "booking.html"), 800);
            } else {
                showMessage("login-message", result.error || "Login failed.", true);
            }
        } catch (error) {
            showMessage("login-message", error.message || "Login failed.", true);
        }
    });
}

async function setupRegisterPage() {
    const form = document.getElementById("register-form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const phone = document.getElementById("register-phone").value.trim();
        const password = document.getElementById("register-password").value.trim();

        if (!name || !email || !phone || !password) {
            showMessage("register-message", "All fields are required.", true);
            return;
        }

        if (password.length < 6) {
            showMessage("register-message", "Password must be at least 6 characters.", true);
            return;
        }

        try {
            const result = await fetchJSON("/api/register", {
                method: "POST",
                body: JSON.stringify({ name, email, phone, password }),
            });
            if (result.user_id) {
                showMessage("register-message", "Registration complete. Please login.", false);
                setTimeout(() => (window.location.href = "login.html"), 900);
            } else {
                showMessage("register-message", result.error || "Registration failed.", true);
            }
        } catch (error) {
            showMessage("register-message", error.message || "Registration failed.", true);
        }
    });
}

let selectedSeat = null;
let selectedBus = null;

async function setupBookingPage() {
    requireLogin();
    const user = getUser();
    const routeSource = document.getElementById("search-source");
    const routeDestination = document.getElementById("search-destination");
    const routeType = document.getElementById("search-bus-type");
    const searchDate = document.getElementById("search-date");
    const searchButton = document.getElementById("search-button");
    const messageId = "search-message";

    try {
        const routes = await fetchJSON("/api/routes");
        if (routes && routes.length) {
            renderRouteOptions(routes, routeSource, routeDestination);
            const filters = getSearchFilters();
            if (filters) {
                routeSource.value = filters.source || "";
                routeDestination.value = filters.destination || "";
                routeType.value = filters.type || "";
                searchDate.value = filters.date || "";
                clearSearchFilters();
                if (filters.source && filters.destination) {
                    await performSearch(filters.source, filters.destination, filters.type);
                }
            }
        }
    } catch (error) {
        showMessage(messageId, "Failed to load routes: " + error.message, true);
    }

    searchButton.addEventListener("click", async () => {
        const source = routeSource.value;
        const destination = routeDestination.value;
        const type = routeType.value;
        const date = searchDate.value;

        if (!source || !destination) {
            showMessage(messageId, "Select both source and destination.", true);
            return;
        }

        saveSearchFilters({ source, destination, date, type });
        await performSearch(source, destination, type);
    });

    const bookButton = document.getElementById("book-seat-button");
    if (bookButton) {
        bookButton.addEventListener("click", async () => {
            if (!selectedBus || !selectedSeat) {
                showMessage("seat-message", "Select a bus and seat before confirming.", true);
                return;
            }
            await confirmBooking(selectedBus, selectedSeat);
        });
    }

    const historySection = document.getElementById("history-content");
    if (historySection) {
        loadHistory(user.user_id);
    }
}

async function performSearch(source, destination, type = "") {
    const messageId = "search-message";
    try {
        showMessage(messageId, "Searching buses...", false);
        const buses = await fetchJSON(`/api/buses?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
        const filtered = (buses || []).filter((bus) => {
            if (!type) return true;
            return String(bus.bus_type).toLowerCase() === type.toLowerCase();
        });
        renderBuses(filtered);
        showMessage(messageId, filtered.length ? "Select a bus to see seats." : "No buses found.", filtered.length === 0);
    } catch (error) {
        showMessage(messageId, "Search failed: " + error.message, true);
    }
}

async function confirmBooking(bus, seat) {
    try {
        const user = getUser();
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        const payload = {
            user_id: user.user_id,
            bus_id: bus.bus_id,
            seat_id: seat.seat_id,
            booking_date: new Date().toISOString().split("T")[0],
        };
        const result = await fetchJSON("/api/bookings", {
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (result.booking_id) {
            localStorage.setItem("latestBooking", JSON.stringify({ booking_id: result.booking_id, bus, seat }));
            showMessage("seat-message", "Booking confirmed. Proceed to payment.", false);
            const paymentLink = document.createElement("a");
            paymentLink.href = "payment.html";
            paymentLink.className = "button";
            paymentLink.textContent = "Go to Payment";
            const seatMessage = document.getElementById("seat-message");
            if (seatMessage) {
                seatMessage.innerHTML = "Booking confirmed successfully. ";
                seatMessage.appendChild(paymentLink);
            }
        } else {
            showMessage("seat-message", result.error || "Booking failed.", true);
        }
    } catch (error) {
        showMessage("seat-message", "Booking failed: " + error.message, true);
    }
}

function renderBuses(buses) {
    const list = document.getElementById("buses-list");
    list.innerHTML = "";
    selectedBus = null;
    selectedSeat = null;
    const seatSection = document.getElementById("seat-list");
    if (seatSection) {
        seatSection.innerHTML = "";
    }
    const bookButton = document.getElementById("book-seat-button");
    if (bookButton) bookButton.disabled = true;

    if (!buses || !buses.length) {
        list.innerHTML = '<div class="card"><p>No matching buses are available for your route.</p></div>';
        return;
    }

    buses.forEach((bus) => {
        const card = document.createElement("div");
        card.className = "bus-card";
        const imageUrl = getBusImage(bus.bus_type);
        const price = bus.price || bus.fare || 950;
        card.innerHTML = `
            <div class="bus-thumb"><img src="${imageUrl}" alt="${bus.bus_type || "Bus"}" /></div>
            <div class="bus-card-body">
                <p class="bus-label">${bus.bus_type || "Premium Bus"}</p>
                <h3>${bus.bus_name}</h3>
                <ul>
                    <li><i class="fas fa-map-marker-alt"></i>${bus.source} → ${bus.destination}</li>
                    <li><i class="fas fa-clock"></i>${bus.departure_time} → ${bus.arrival_time}</li>
                    <li><i class="fas fa-chair"></i>${bus.total_seats || bus.available_seats || "N/A"} seats</li>
                    <li><i class="fas fa-dollar-sign"></i>₹${price}</li>
                </ul>
                <button type="button" class="button secondary small">Book Now</button>
            </div>
        `;
        card.addEventListener("click", () => loadSeats(bus));
        list.appendChild(card);
    });
}

async function loadSeats(bus) {
    selectedBus = bus;
    try {
        const seats = await fetchJSON(`/api/seats?bus_id=${encodeURIComponent(bus.bus_id)}`);
        const seatContainer = document.getElementById("seat-list");
        seatContainer.innerHTML = "";
        selectedSeat = null;
        const bookButton = document.getElementById("book-seat-button");
        if (bookButton) bookButton.disabled = true;

        if (!seats || !seats.length) {
            seatContainer.innerHTML = "<p>No seats available for this bus.</p>";
            return;
        }

        seats.forEach((seat) => {
            const seatCard = document.createElement("div");
            seatCard.className = `seat-card ${seat.availability.toLowerCase()}`;
            seatCard.innerHTML = `<h3>${seat.seat_number}</h3><p>${seat.seat_type}</p><p>${seat.availability}</p>`;
            if (seat.availability.toLowerCase() === "available") {
                seatCard.addEventListener("click", () => {
                    document.querySelectorAll(".seat-card.selected").forEach((el) => el.classList.remove("selected"));
                    seatCard.classList.add("selected");
                    selectedSeat = seat;
                    if (bookButton) bookButton.disabled = false;
                    showMessage("seat-message", `Selected ${seat.seat_number} on ${bus.bus_name}.`, false);
                });
            }
            seatContainer.appendChild(seatCard);
        });
    } catch (error) {
        showMessage("seat-message", "Failed to load seats: " + error.message, true);
    }
}

async function loadHistory(userId) {
    try {
        const history = await fetchJSON(`/api/booking-history/${encodeURIComponent(userId)}`);
        const container = document.getElementById("history-content");
        if (!history || !history.length) {
            container.innerHTML = "<p>No booking history found.</p>";
            return;
        }
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr><th>ID</th><th>Bus</th><th>Seat</th><th>Route</th><th>Date</th><th>Payment</th></tr>
            </thead>
        `;
        const body = document.createElement("tbody");
        history.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.booking_id}</td>
                <td>${item.bus_name}</td>
                <td>${item.seat_number}</td>
                <td>${item.source} ? ${item.destination}</td>
                <td>${item.booking_date}</td>
                <td>${item.payment_status || "Pending"}</td>
            `;
            body.appendChild(row);
        });
        table.appendChild(body);
        container.innerHTML = "";
        container.appendChild(table);
    } catch (error) {
        const container = document.getElementById("history-content");
        container.innerHTML = `<p class="error">Error loading history: ${error.message}</p>`;
    }
}

async function setupPaymentPage() {
    requireLogin();
    const booking = JSON.parse(localStorage.getItem("latestBooking") || "null");
    const summary = document.getElementById("payment-summary");
    const form = document.getElementById("payment-form");
    if (!booking) {
        summary.innerHTML = "<p>No booking found. Please make a reservation first.</p>";
        if (form) form.style.display = "none";
        return;
    }
    const fare = calculateFare(booking.bus.bus_type);
    summary.innerHTML = `
        <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
        <p><strong>Bus:</strong> ${booking.bus.bus_name}</p>
        <p><strong>Route:</strong> ${booking.bus.source} → ${booking.bus.destination}</p>
        <p><strong>Seat:</strong> ${booking.seat.seat_number} (${booking.seat.seat_type})</p>
        <p><strong>Amount:</strong> ₹${fare.toFixed(2)}</p>
    `;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const paymentMethod = document.getElementById("payment-method").value;
        try {
            const result = await fetchJSON("/api/payments", {
                method: "POST",
                body: JSON.stringify({
                    booking_id: booking.booking_id,
                    amount: fare,
                    payment_method: paymentMethod,
                    payment_status: "Completed",
                }),
            });
            if (result.payment_id) {
                showMessage("payment-message", "Payment successful. Thank you! Redirecting...", false);
                localStorage.removeItem("latestBooking");
                const popup = document.getElementById("payment-popup");
                if (popup) popup.classList.remove("hidden");
                setTimeout(() => (window.location.href = "booking.html"), 1600);
            } else {
                showMessage("payment-message", result.error || "Payment failed.", true);
            }
        } catch (error) {
            showMessage("payment-message", "Payment error: " + error.message, true);
        }
    });
}

function calculateFare(type) {
    const fareTable = {
        "AC Sleeper": 1200,
        "Semi-Sleeper": 850,
        "Volvo": 1100,
        "Luxury Bus": 1450,
        "Express Bus": 980,
        "AC Seater": 980,
        "Non-AC Seater": 700,
    };
    return fareTable[type] || 750;
}

async function setupAdminPage() {
    const routeSelect = document.getElementById("admin-bus-route");
    const seatBusSelect = document.getElementById("admin-seat-bus");
    const routeForm = document.getElementById("route-form");
    const busForm = document.getElementById("bus-form");
    const seatForm = document.getElementById("seat-form");

    try {
        const routes = await fetchJSON("/api/routes");
        const buses = await fetchJSON("/api/buses");
        const bookings = await fetchJSON("/api/admin/bookings");
        populateRouteDropdown(routes, routeSelect);
        populateBusDropdown(buses, seatBusSelect);
        renderAdminBookings(bookings);
        updateAdminStats(routes.length, buses.length, 0, bookings.length);
    } catch (error) {
        console.error("Admin page initialization error:", error);
        alert("Failed to load admin data: " + error.message);
        return;
    }

    routeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const source = document.getElementById("admin-route-source").value.trim();
        const destination = document.getElementById("admin-route-destination").value.trim();
        const departure_time = document.getElementById("admin-route-departure").value;
        const arrival_time = document.getElementById("admin-route-arrival").value;

        if (!source || !destination || !departure_time || !arrival_time) {
            showMessage("admin-route-message", "All fields are required", true);
            return;
        }

        try {
            const result = await fetchJSON("/api/admin/routes", {
                method: "POST",
                body: JSON.stringify({ source, destination, departure_time, arrival_time }),
            });
            if (result.route_id) {
                showMessage("admin-route-message", "Route added successfully", false);
                routeForm.reset();
                const updatedRoutes = await fetchJSON("/api/routes");
                populateRouteDropdown(updatedRoutes, routeSelect);
                updateAdminStats(updatedRoutes.length, null, null, null);
            } else {
                showMessage("admin-route-message", result.error || "Route creation failed", true);
            }
        } catch (error) {
            showMessage("admin-route-message", error.message, true);
        }
    });

    busForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const bus_name = document.getElementById("admin-bus-name").value.trim();
        const bus_type = document.getElementById("admin-bus-type").value.trim();
        const total_seats = parseInt(document.getElementById("admin-bus-total").value, 10);
        const route_id = parseInt(routeSelect.value, 10);

        if (!bus_name || !bus_type || !total_seats || !route_id) {
            showMessage("admin-bus-message", "All fields are required", true);
            return;
        }

        try {
            const result = await fetchJSON("/api/admin/buses", {
                method: "POST",
                body: JSON.stringify({ bus_name, bus_type, total_seats, route_id }),
            });
            if (result.bus_id) {
                showMessage("admin-bus-message", "Bus added successfully", false);
                busForm.reset();
                const updatedBuses = await fetchJSON("/api/buses");
                populateBusDropdown(updatedBuses, seatBusSelect);
                updateAdminStats(null, updatedBuses.length, null, null);
            } else {
                showMessage("admin-bus-message", result.error || "Bus creation failed", true);
            }
        } catch (error) {
            showMessage("admin-bus-message", error.message, true);
        }
    });

    seatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const bus_id = parseInt(document.getElementById("admin-seat-bus").value, 10);
        const seat_number = document.getElementById("admin-seat-number").value.trim();
        const seat_type = document.getElementById("admin-seat-type").value.trim();
        const availability = document.getElementById("admin-seat-availability").value;

        if (!bus_id || !seat_number || !seat_type) {
            showMessage("admin-seat-message", "All fields are required", true);
            return;
        }

        try {
            const result = await fetchJSON("/api/admin/seats", {
                method: "POST",
                body: JSON.stringify({ bus_id, seat_number, seat_type, availability }),
            });
            if (result.seat_id) {
                showMessage("admin-seat-message", "Seat added successfully", false);
                seatForm.reset();
            } else {
                showMessage("admin-seat-message", result.error || "Seat creation failed", true);
            }
        } catch (error) {
            showMessage("admin-seat-message", error.message, true);
        }
    });

    const updateSeatForm = document.getElementById("update-seat-form");
    updateSeatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const seat_id = parseInt(document.getElementById("admin-update-seat-id").value, 10);
        const availability = document.getElementById("admin-update-seat-availability").value;

        if (!seat_id) {
            showMessage("admin-update-seat-message", "Seat ID is required", true);
            return;
        }

        try {
            const result = await fetchJSON(`/api/seats/${seat_id}`, {
                method: "PUT",
                body: JSON.stringify({ availability }),
            });
            showMessage("admin-update-seat-message", result.message || result.error, !result.message);
            if (result.message) {
                updateSeatForm.reset();
            }
        } catch (error) {
            showMessage("admin-update-seat-message", error.message, true);
        }
    });

    const cancelBookingForm = document.getElementById("cancel-booking-form");
    cancelBookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const booking_id = parseInt(document.getElementById("admin-cancel-booking-id").value, 10);

        if (!booking_id) {
            showMessage("admin-cancel-booking-message", "Booking ID is required", true);
            return;
        }

        try {
            const result = await fetchJSON(`/api/bookings/${booking_id}`, {
                method: "DELETE",
            });
            showMessage("admin-cancel-booking-message", result.message || result.error, !result.message);
            if (result.message) {
                cancelBookingForm.reset();
                const bookings = await fetchJSON("/api/admin/bookings");
                renderAdminBookings(bookings);
                updateAdminStats(null, null, null, bookings.length);
            }
        } catch (error) {
            showMessage("admin-cancel-booking-message", error.message, true);
        }
    });
}

function populateRouteDropdown(routes, dropdown) {
    dropdown.innerHTML = "";
    routes.forEach((route) => {
        const option = document.createElement("option");
        option.value = route.route_id;
        option.textContent = `${route.source} ? ${route.destination}`;
        dropdown.appendChild(option);
    });
}

function populateBusDropdown(buses, dropdown) {
    dropdown.innerHTML = "";
    buses.forEach((bus) => {
        const option = document.createElement("option");
        option.value = bus.bus_id;
        option.textContent = `${bus.bus_name} (${bus.source} ? ${bus.destination})`;
        dropdown.appendChild(option);
    });
}

async function renderAdminBookings(bookings) {
    try {
        const container = document.getElementById("admin-bookings");
        if (!bookings || !bookings.length) {
            container.innerHTML = "<p>No bookings available.</p>";
            return;
        }
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr><th>ID</th><th>User</th><th>Bus</th><th>Seat</th><th>Date</th></tr>
            </thead>
        `;
        const body = document.createElement("tbody");
        bookings.forEach((book) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${book.booking_id}</td>
                <td>${book.user_id}</td>
                <td>${book.bus_id}</td>
                <td>${book.seat_id}</td>
                <td>${book.booking_date}</td>
            `;
            body.appendChild(row);
        });
        table.appendChild(body);
        container.innerHTML = "";
        container.appendChild(table);
    } catch (error) {
        const container = document.getElementById("admin-bookings");
        container.innerHTML = `<p class="error">Error loading bookings: ${error.message}</p>`;
    }
}

function updateAdminStats(routeCount, busCount, seatCount, bookingCount) {
    if (routeCount !== null) {
        const el = document.getElementById("routes-count");
        if (el) el.textContent = routeCount;
    }
    if (busCount !== null) {
        const el = document.getElementById("buses-count");
        if (el) el.textContent = busCount;
    }
    if (seatCount !== null) {
        const el = document.getElementById("seats-count");
        if (el) el.textContent = seatCount;
    }
    if (bookingCount !== null) {
        const el = document.getElementById("bookings-count");
        if (el) el.textContent = bookingCount;
    }
}

window.addEventListener("DOMContentLoaded", initPage);
