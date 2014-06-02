var Sequelize = require('sequelize'),
    sequelize = new Sequelize('database', 'username', 'password')
 
var User = sequelize.define('User', {
  username: Sequelize.STRING,
  birthday: Sequelize.DATE
})
 
sequelize.sync().success(function() {
  User.create({
    username: 'sdepold',
    birthday: new Date(1986, 06, 28)
  }).success(function(sdepold) {
    console.log(sdepold.values)
  })
})
