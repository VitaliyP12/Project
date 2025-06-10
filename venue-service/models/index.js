const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
});

// Імпортуємо фабрики моделей
const VenueModel = require('./venue.model');
const SlotModel = require('./slot.model');

// Ініціалізуємо моделі
const Venue = VenueModel(sequelize);
const Slot = SlotModel(sequelize);

// Встановлюємо зв’язки
Venue.hasMany(Slot, {
    foreignKey: 'venue_id',
    as: 'slots',
    onDelete: 'CASCADE'
});
Slot.belongsTo(Venue, {
    foreignKey: 'venue_id',
    as: 'venue',
    onDelete: 'CASCADE'
});

module.exports = {
    sequelize,
    Venue,
    Slot
};
