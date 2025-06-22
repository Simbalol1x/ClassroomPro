// In migrations/YYYYMMDDHHMMSS-remove-subject-from-classes.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove the 'subject' column from the 'Classes' table
    await queryInterface.removeColumn('Classes', 'subject');
  },

  async down (queryInterface, Sequelize) {
    // Add the 'subject' column back if we need to revert the migration
    await queryInterface.addColumn('Classes', 'subject', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};