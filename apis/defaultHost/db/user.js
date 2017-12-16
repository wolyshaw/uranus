const Sequelize = require('sequelize')
const sequelize = require('./index')

 module.exports = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING
})
