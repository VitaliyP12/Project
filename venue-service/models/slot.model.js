const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Slot', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        venue_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        start_time: DataTypes.DATE,
        end_time: DataTypes.DATE,
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'available_slots',
        timestamps: false
    });
};
