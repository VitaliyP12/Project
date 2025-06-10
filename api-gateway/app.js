const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { connectRabbitMQ, authenticateUser, authenticateAdmin } = require('./rabbitmq/rpcClient');
const userRoutes = require('./routes/user.routes');
const slotRoutes = require('./routes/slots.routes');
const bookingRoutes = require('./routes/booking.routes');

dotenv.config();

const app = express();
app.use(express.json());

// API маршрути
app.use('/api/user', userRoutes);
app.use('/api/venue/admin', authenticateAdmin, slotRoutes);
app.use('/api/venue', slotRoutes);  // окремо після admin, щоб не перекривати
app.use('/api/bookings', authenticateUser, bookingRoutes);

// Обробка 404 для API
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Сервер React фронтенду (build)
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

connectRabbitMQ().then(() => {
    app.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });
});
