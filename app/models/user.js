'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var User = sequelize.define('User', {
    id: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    first_name: {
      type: DataType.STRING,
      validate: {
        len: {args: [1, 30], msg: 'First names must be within 1 - 30 characters long.'}
      }
    },
    last_name: {
      type: DataType.STRING,
      defaultValue: '',
      validate: {
        len: {args: [0, 80], msg: 'Last names must be within 0 - 80 characters long.'}
      }
    },
    type: {
      type: DataType.STRING,
      defaultValue: 0
    },
    auth_user_key: {
      type: DataType.STRING,
      defaultValue: ''
    },
    notes: {
      type: DataType.TEXT,
      defaultValue: ''
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.UserPassports, {as: 'Passports', foreignKey: 'user_id', useJunctionTable: false});
      },
    },
    tableName:  'user', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return User;
}

module.exports = Model;
