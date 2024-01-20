// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());

// Data storage (you may replace this with a database)
const rooms = [];
const bookings = [];

// 1. Create a Room
app.post('/create-room', (req, res) => {
    const { roomName, seats, amenities, pricePerHour } = req.body;
    const room = {
        roomName,
        seats,
        amenities,
        pricePerHour,
        bookedStatus: false,
    };
    rooms.push(room);
    res.status(201).json({ message: 'Room created successfully', room });
});

// 2. Book a Room
app.post('/book-room', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Check if the room is available for booking
    const room = rooms.find((r) => r.roomName === roomId && !r.bookedStatus);
    if (!room) {
        return res.status(400).json({ error: 'Room not available for booking' });
    }

    // Check if the room is available at the specified date and time
    const conflictingBooking = bookings.find(
        (booking) =>
            booking.roomId === roomId &&
            booking.date === date &&
            ((startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime))
    );

    if (conflictingBooking) {
        return res.status(400).json({ error: 'Room already booked for the given date and time' });
    }

    // Book the room
    room.bookedStatus = true;
    const booking = {
        customerName,
        date,
        startTime,
        endTime,
        roomId,
        bookingId: bookings.length + 1,
        bookingDate: new Date(),
    };
    bookings.push(booking);

    res.status(201).json({ message: 'Room booked successfully', booking });
});

// 3. List all Rooms with Booked Data
app.get('/list-rooms', (req, res) => {
    const roomList = rooms.map((room) => {
        const booking = bookings.find((booking) => booking.roomId === room.roomName);
        return {
            roomName: room.roomName,
            bookedStatus: room.bookedStatus,
            customerName: booking ? booking.customerName : null,
            date: booking ? booking.date : null,
            startTime: booking ? booking.startTime : null,
            endTime: booking ? booking.endTime : null,
        };
    });
    res.json(roomList);
});

// 4. List all Customers with Booked Data
app.get('/list-customers', (req, res) => {
    const customerList = bookings.map((booking) => {
        const room = rooms.find((r) => r.roomName === booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room.roomName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        };
    });
    res.json(customerList);
});

// 5. List how many times a customer has booked the room
app.get('/customer-booking-history/:customerName', (req, res) => {
    const { customerName } = req.params;
    const customerBookings = bookings.filter((booking) => booking.customerName === customerName);
    res.json(customerBookings);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
