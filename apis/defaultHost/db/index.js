const Sequelize = require('sequelize')
const config = eval(fs.readFileSync(path.join(__dirname, 'config.js'), {
  encoding: 'utf8'
}))
const sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.pass, {
  host: config.mysql.host,
  dialect: config.mysql.dialect,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
})

module.exports = sequelize
