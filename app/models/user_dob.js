'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserDOB = sequelize.define('UserDOB', {
    id_user_dob: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references: 'user',
      referencesKey: 'id'
    },
    fk_id_dob: {
      type: DataType.INTEGER,
      references: 'dob',
      referencesKey: 'id_dob'
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserDOB.hasMany(models.DOB, {foreignKey: 'id_userdob'});
      }
    },
    tableName:  'user_dob', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserDOB;
}

module.exports = Model;
