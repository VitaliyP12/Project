const express = require('express');
const { sendRPCRequest } = require('../rabbitmq/rpcClient');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const router = express.Router();
const USER_RPC_QUEUE = process.env.USER_RPC_QUEUE;

router.post('/register', async (req, res) => {
    try {
        const response = await sendRPCRequest(USER_RPC_QUEUE, {
            action: 'register',
            data: req.body,
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});

router.post('/login', async (req, res) => {
    console.log('Login request body:', req.body);  // <-- тут лог для перевірки вхідних даних

    try {
        const response = await sendRPCRequest(USER_RPC_QUEUE, {
            action: 'login',
            data: req.body,
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});

const authenticateAny = (req, res, next) => {
    const auth = req.headers.authorization?.split(' ')[1];
    if (!auth) return res.status(401).json({ message: 'Token not provided' });
    try {
        req.user = jwt.verify(auth, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ message: 'Invalid token' });
    }
};

// єдиний роут для профілю
router.get('/profile', authenticateAny, (req, res) => {
    res.json(req.user);
});




module.exports = router;
