const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Booking', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        venue_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        slot_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        start_time: DataTypes.DATE,
        end_time: DataTypes.DATE,
        status: DataTypes.STRING,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'bookings',
        timestamps: false,
    });

}