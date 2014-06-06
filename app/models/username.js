'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserName = sequelize.define('UserName', {
    id_username: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    name_first: {
      type: DataType.STRING
    },
    name_last: {
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
