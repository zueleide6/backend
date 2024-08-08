const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('UltimateKL', 'root', 'Dopamina@1', {
  host: '193.149.185.125',
  port: 3306,
  dialect: 'mysql'
});

module.exports = sequelize;
