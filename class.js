module.exports = (sequelize, DataTypes) => {
    const Class = sequelize.define('Class', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        className: { type: DataTypes.STRING, allowNull: false },
        classCode: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        joinPasswordHash: { type: DataTypes.STRING, allowNull: true },
        teacherId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    });

    Class.associate = function(models) {
        Class.belongsTo(models.User, { foreignKey: 'teacherId', as: 'Teacher' });
        Class.belongsToMany(models.User, { through: models.Enrollment, as: 'EnrolledStudents', foreignKey: 'classId' });
        Class.hasMany(models.Announcement, { foreignKey: 'classId', as: 'Announcements' });
    };

    return Class;
};