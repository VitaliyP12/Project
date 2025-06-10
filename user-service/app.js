require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const { start } = require('./rabbitmq/consumer');


const app = express();
app.use(express.json());

sequelize.sync().then(() => {
    console.log('DB synced');
    app.listen(process.env.PORT, async () => {
        console.log(`User Service running on port ${process.env.PORT}`);
        start();
    });
});
