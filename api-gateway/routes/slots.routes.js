require('dotenv').config();
const express = require('express');
const { sendRPCRequest, authenticateUser, authenticateAdmin} = require('../rabbitmq/rpcClient');

const router = express.Router();
const VENUE_RPC_QUEUE = process.env.VENUE_RPC_QUEUE;


router.get('/get_all', async (req, res) => {
    try {
        const response = await sendRPCRequest(VENUE_RPC_QUEUE, {
            action: 'get_all',
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});

router.get('/find_by_id/:id', async (req, res) => {
    try {

        const response = await sendRPCRequest(VENUE_RPC_QUEUE, {
            action: 'get_slots_by_venue',
            data: { id: req.params.id },
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});



router.use(authenticateAdmin);

// Створення нового майданчика
router.post('/create', async (req, res) => {
    try {
        const response = await sendRPCRequest(VENUE_RPC_QUEUE, {
            action: 'create',
            data: req.body,
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});

// Створення слоту
router.post('/createslot', async (req, res) => {
    try {
        const response = await sendRPCRequest(VENUE_RPC_QUEUE, {
            action: 'createSlot',
            data: { id: req.params.id, ...req.body },
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});

// Видалення майданчика
router.delete('/delete/:id', async (req, res) => {
    try {
        const response = await sendRPCRequest(VENUE_RPC_QUEUE, {
            action: 'deleteVenue',
            data: { id: req.params.id },
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});


// Видалення слоту
router.delete('/deleteslot/:id', async (req, res) => {
    try {
        const response = await sendRPCRequest(VENUE_RPC_QUEUE, {
            action: 'deleteSlot',
            data: { id: req.params.id },
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});


module.exports = router;
