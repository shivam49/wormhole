'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserNames = sequelize.define('UserNames', {
    id_name: {
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
        UserNames.belongsTo(models.User_Name, {foreignKey: 'id_name'});
      }
    },
    tableName:  'usernames', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return UserNames;
}

module.exports = Model;
