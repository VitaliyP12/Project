require('dotenv').config();
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');

let channel;

async function connectRabbitMQ() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
}

async function sendRPCRequest(queue, message) {
    const correlationId = uuidv4();
    const replyQueue = await channel.assertQueue('', { exclusive: true });

    return new Promise((resolve) => {
        channel.consume(
            replyQueue.queue,
            (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    const data = JSON.parse(msg.content.toString());
                    resolve(data);
                }
            },
            { noAck: true }
        );

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            correlationId,
            replyTo: replyQueue.queue
        });
    });
}

async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const userResponse = await validateUserWithRPC(userId);

        if (!userResponse || userResponse.success !== false) {
            return res.status(401).json({ msg: "Unauthorized: Invalid token or user data" });
        }

        // Якщо перевірка пройшла, перевіряємо роль
        if (userResponse.role !== 'user') {
            return res.status(403).json({ msg: "Forbidden: You are not user" });
        }

        // Якщо все ок, додаємо user в req
        req.user = userResponse;
        next();
    } catch (error) {
        console.error("JWT or RPC Error:", error);
        return res.status(401).json({ msg: "Unauthorized: Invalid token" });
    }
}

async function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const userResponse = await validateUserWithRPC(userId);

        if (!userResponse || userResponse.success !== true) {
            return res.status(401).json({ msg: "Unauthorized: Invalid token or user data" });
        }

        // Якщо перевірка пройшла, перевіряємо роль
        if (userResponse.role !== 'admin') {
            return res.status(403).json({ msg: "Forbidden: You are not an admin" });
        }

        // Якщо все ок, додаємо user в req
        req.user = userResponse;
        next();
    } catch (error) {
        console.error("JWT or RPC Error:", error);
        return res.status(401).json({ msg: "Unauthorized: Invalid token" });
    }
}



async function validateUserWithRPC(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            const correlationId = randomUUID();
            const replyQueue = await channel.assertQueue('', { exclusive: true });

            channel.consume(
                replyQueue.queue,
                (msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        let parsed = null;
                        try {
                            parsed = JSON.parse(msg.content.toString());
                        } catch (err) {
                            return reject(new Error("Failed to parse response"));
                        }

                        if (!parsed) {
                            return resolve({ success: false });
                        }

                        parsed.success = parsed.role === 'admin';

                        resolve(parsed);
                    }
                },
                { noAck: true }
            );


            const payload = {
                action: "validate_user",
                data: { userId },
            };

            channel.sendToQueue("user_rpc_queue", Buffer.from(JSON.stringify(payload)), {
                correlationId,
                replyTo: replyQueue.queue,
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { connectRabbitMQ, sendRPCRequest, authenticateUser, authenticateAdmin };