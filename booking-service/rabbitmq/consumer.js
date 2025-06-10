require('dotenv').config();
const amqp = require('amqplib');
const {createBooking, getBookingsByUser, cancelBooking } = require('../controllers/booking.controller');


async function start() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(process.env.RPC_QUEUE, { durable: false });
    console.log(`[x] Waiting for RPC requests on ${process.env.RPC_QUEUE}`);

    channel.consume(process.env.BOOKING_RPC_QUEUE, async (msg) => {
        const {action, data} = JSON.parse(msg.content.toString());

        let response;
        if (action === 'create') {
            response = await createBooking(data);
        } else if (action === 'get') {
            response = await getBookingsByUser(data.userId);
        } else if (action === 'cancel') {
            response = await cancelBooking(data.id);
        } else {
            response = {status: 400, body: {message: 'Unknown action'}};
        }

        channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {correlationId: msg.properties.correlationId}
        );

        channel.ack(msg);
    });
}

module.exports = { start };
