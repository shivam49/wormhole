'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserName = sequelize.define('User_Name', {
    id_user_name: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references: 'user',
      referencesKey: 'id_user'
    },
    fk_id_username: {
      type: DataType.INTEGER,
      references: 'username',
      referencesKey: 'id_username'
    },
    active: {
      type: DataType.BOOLEAN,
      defaultValue: true
    },
  }, {
    classMethods: {
      associate: function(models) {
        UserName.hasMany(models.UserName, {foreignKey: 'id_username'});
      }
    },
    tableName:  'user_name', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserName;
}

module.exports = Model;
