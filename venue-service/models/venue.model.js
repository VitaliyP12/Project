const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Venue', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        location: DataTypes.STRING,
        type: DataTypes.ENUM('football', 'tennis'),
        description: DataTypes.TEXT,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'venues',
        timestamps: false
    });
};


