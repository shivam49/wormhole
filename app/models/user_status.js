'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserStatus = sequelize.define('UserStatus', {
    id_user_email: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references:     'user',
      referencesKey:  'id'
    },
    fk_id_email: {
      type: DataType.INTEGER,
      references:     'email',
      referencesKey:  'id_email'
    },
    fk_id_verifier: {
      type: DataType.INTEGER,
      references:     'verifier',
      referencesKey:  'id_verifier'
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserStatus.hasMany(models.Status, {foreignKey: 'id_status'});
      }
    },
    tableName:  'user_status', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserStatus;
}

module.exports = Model;
