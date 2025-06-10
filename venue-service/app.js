require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const { start } = require('./rabittmq/consumer');


const app = express();
app.use(express.json());

sequelize.sync().then(() => {
    console.log(' DB synced');
    app.listen(process.env.PORT, async () => {
        console.log(`Venue Service running on port ${process.env.PORT}`);
        await start();
    });
});
