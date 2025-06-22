'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // This function runs when you migrate
    await queryInterface.createTable('AnnouncementViews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the target model
          key: 'id',      // Key in the target model
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      announcementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Announcements', // Name of the target model
          key: 'id',           // Key in the target model
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add a unique index to prevent duplicate entries
    await queryInterface.addIndex(
      'AnnouncementViews',
      ['userId', 'announcementId'],
      {
        unique: true,
        name: 'user_announcement_unique_idx'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // This function runs if you need to roll back the migration
    await queryInterface.dropTable('AnnouncementViews');
  }
};