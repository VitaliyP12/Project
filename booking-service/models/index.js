const { Sequelize } = require('sequelize');
require('dotenv').config();

// Ініціалізація підключення до бази даних
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
});

// Імпортуємо фабрики моделей
const VenueModel = require('../../venue-service/models/venue.model'); //CHANGE PATH
const SlotModel = require('../../venue-service/models/slot.model'); //CHANGE PATH
const BookingModel = require('./booking.model');  // Додаємо модель Booking

// Ініціалізуємо моделі
const Venue = VenueModel(sequelize);
const Slot = SlotModel(sequelize);
const Booking = BookingModel(sequelize);  // Ініціалізуємо Booking

// Встановлюємо зв’язки між моделями
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

// Зв'язок для моделі Booking
Booking.belongsTo(Venue, {
    foreignKey: 'venue_id',
    as: 'venue',
});
Booking.belongsTo(Slot, {
    foreignKey: 'slot_id',
    as: 'slot',
});

module.exports = {
    sequelize,
    Venue,
    Slot,
    Booking
};