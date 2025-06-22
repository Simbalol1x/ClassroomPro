
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: { name: 'unique_email', msg: 'This email is already registered.' },
            validate: { isEmail: { msg: "Must be a valid email address."} }
        },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        role: { type: DataTypes.ENUM('teacher', 'student'), allowNull: false },
        resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
        resetPasswordExpires: { type: DataTypes.DATE, allowNull: true }
    });

    User.associate = function(models) {
        User.hasMany(models.Class, { foreignKey: 'teacherId', as: 'TaughtClasses', onDelete: 'CASCADE' });
        User.belongsToMany(models.Class, { through: models.Enrollment, as: 'EnrolledClasses', foreignKey: 'studentId' });
        // NEW: Association to track viewed announcements
        User.belongsToMany(models.Announcement, { through: models.AnnouncementView, as: 'ViewedAnnouncements', foreignKey: 'userId' });
    };

    return User;
};

