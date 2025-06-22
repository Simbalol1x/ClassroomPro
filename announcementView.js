module.exports = (sequelize, DataTypes) => {
    const AnnouncementView = sequelize.define('AnnouncementView', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE'
        },
        announcementId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Announcements', key: 'id' },
            onDelete: 'CASCADE'
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['userId', 'announcementId']
            }
        ]
    });

    return AnnouncementView;
};