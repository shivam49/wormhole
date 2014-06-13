'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserName = sequelize.define('UserName', {
    id_username: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    username: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserName.belongsTo(models.User_Name, {foreignKey: 'id_username'});
      }
    },
    tableName:  'username', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return UserName;
}

module.exports = Model;
