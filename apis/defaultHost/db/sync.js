const sequelize = require('./index')
const User = require('./user')

sequelize.sync({force: true})
  .then(() => User.create({
    username: 'admin',
    password: '123456'
  }))
  .then(user => {
    console.log(`user create success`)
  })
