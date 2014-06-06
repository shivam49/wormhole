'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserPassword = sequelize.define('UserPassword', {
    id_user_password: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references:     'user',
      referencesKey:  'id_user'
    },
    fk_id_password: {
      type: DataType.INTEGER,
      references:     'password',
      referencesKey:  'id_password'
    },
    active: {
      type: DataType.BOOLEAN,
      defaultValue: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserPassword.hasMany(models.Password, {foreignKey: 'id_password'});
      }
    },
    tableName:  'user_password', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserPassword;
}

module.exports = Model;
