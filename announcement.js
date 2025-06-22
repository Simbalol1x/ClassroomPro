module.exports = (sequelize, DataTypes) => {
    const Announcement = sequelize.define('Announcement', {
        id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        classId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Classes',
                key: 'id'
            }
        }
    });

    Announcement.associate = function(models) {
        // An announcement belongs to one class
        Announcement.belongsTo(models.Class, { 
            foreignKey: 'classId', 
            onDelete: 'CASCADE'
        });
        // NEW: Association to track which users have viewed this announcement
        Announcement.belongsToMany(models.User, {
            through: models.AnnouncementView,
            as: 'ViewedBy',
            foreignKey: 'announcementId'
        });
    };

    return Announcement;
};