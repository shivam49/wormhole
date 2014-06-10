'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserEmail = sequelize.define('UserEmail', {
    id_user_email: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references:     'user',
      referencesKey:  'id_user'
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
    },
    active: {
      type: DataType.BOOLEAN,
      defaultValue: true
    },
    primary: {
      type: DataType.BOOLEAN,
      defaultValue: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserEmail.belongsTo(models.User, {foreignKey: 'fk_id_user'});
        UserEmail.hasMany(models.Email, {foreignKey: 'id_email'});
        UserEmail.hasMany(models.Verifier, {foreignKey: 'id_verifier'});
      }
    },
    tableName:  'user_email', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserEmail;
}

module.exports = Model;
