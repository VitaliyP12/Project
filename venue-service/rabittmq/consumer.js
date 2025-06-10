const amqp = require('amqplib');
const { createVenue, getAllVenues, getSlotsByVenueId,createSlot,deleteSlot,deleteVenue} = require('../controllers/slot.controller');
require('dotenv').config();

async function start() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(process.env.RPC_QUEUE, { durable: false });
    console.log(`[x] Waiting for RPC requests on ${process.env.RPC_QUEUE}`);

     channel.consume(process.env.VENUE_RPC_QUEUE, async (msg) => {
        const {action, data} = JSON.parse(msg.content.toString());

        let response;
        if (action === 'create') {
            response = await createVenue(data);
        } else if (action === 'get_all') {
            response = await getAllVenues();
        } else if (action === 'get_slots_by_venue') {
            response = await getSlotsByVenueId(data.id);
        }else if (action === 'deleteVenue') {
            console.log('[RPC] Отримано запит на видалення майданчика з ID:', data.id);
            response = await deleteVenue(data.id);
        } else if (action === 'createSlot') {
            response = await createSlot(data);
        } else if (action === 'deleteSlot') {
            response = await deleteSlot(data.id);
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
