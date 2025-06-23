'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development'; // Determine the environment
const config = require(__dirname + '/../config/config.json')[env]; // Load the config for the determined environment
const db = {};

let sequelize; // Declare sequelize variable

// Initialize Sequelize based on the loaded configuration
if (config.use_env_variable) {
  // If use_env_variable is set (e.g., for production with DATABASE_URL)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Otherwise, use the individual database, username, password, storage, etc. (e.g., for development with SQLite)
  // For SQLite, only 'storage' is typically in 'config' if not using username/password.
  // The 'config' object itself will have 'dialect', 'storage', 'logging'.
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Pass the correctly initialized sequelize instance and DataTypes to each model
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // The correctly initialized sequelize instance
db.Sequelize = Sequelize;

module.exports = db;
