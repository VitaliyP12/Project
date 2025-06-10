const express = require('express');
const { sendRPCRequest, authenticateUser} = require('../rabbitmq/rpcClient');
require('dotenv').config();

const router = express.Router();
const BOOKING_RPC_QUEUE = process.env.BOOKING_RPC_QUEUE;

router.use(authenticateUser);

router.post('/create', async (req, res) => {
    try {
        console.log('Booking create body:', req.body);
        const response = await sendRPCRequest(BOOKING_RPC_QUEUE, {
            action: 'create',
            data: req.body,
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});



router.get('/:userId', async (req, res) => {
    try {

        const response = await sendRPCRequest(BOOKING_RPC_QUEUE, {
            action: 'get',
            data: { userId: req.params.userId },  // Виправлено: передаємо userId
        });

        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});


router.delete('/:bookingId', async (req, res) => {
    try {

        const response = await sendRPCRequest(BOOKING_RPC_QUEUE, {
            action: 'cancel',
            data: { id: req.params.bookingId },  // Правильний параметр
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});


module.exports = router;