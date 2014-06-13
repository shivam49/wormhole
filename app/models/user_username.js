'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserUsername = sequelize.define('UserUsername', {
    id_user_username: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references:     'user',
      referencesKey:  'id_user'
    },
    fk_id_username: {
      type: DataType.INTEGER,
      references:     'username',
      referencesKey:  'id_username'
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserUsername.hasMany(models.UserNames, {foreignKey: 'id_name'});
        UserUsername.hasMany(models.UserName, {foreignKey: 'id_username'});
      }
    },
    tableName:  'user_username', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserUsername;
}

module.exports = Model;
