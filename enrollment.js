module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define('Enrollment', {
        id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },
        enrollmentDate: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        },
        // NEW: Add the coursePoints field to the model definition
        coursePoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' }
        },
        classId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Classes', key: 'id' }
        }
    }, {
        indexes: [
            { unique: true, fields: ['studentId', 'classId'] }
        ]
    });

    Enrollment.associate = function(models) {
        Enrollment.belongsTo(models.User, { foreignKey: 'studentId', onDelete: 'CASCADE' });
        Enrollment.belongsTo(models.Class, { foreignKey: 'classId', onDelete: 'CASCADE' });
    };

    return Enrollment;
};