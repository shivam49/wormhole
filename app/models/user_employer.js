'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserEmployer = sequelize.define('UserEmployer', {
    id_user_employer: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references:     'user',
      referencesKey:  'id'
    },
    fk_id_employer: {
      type: DataType.INTEGER,
      references:     'employer',
      referencesKey:  'id_employer'
    },
    fk_id_position: {
      type: DataType.INTEGER,
      references:     'position',
      referencesKey:  'id_position'
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserEmployer.hasMany(models.Employer, {foreignKey: 'id_employer'});
        UserEmployer.hasMany(models.Position, {foreignKey: 'id_position'});
      }
    },
    tableName:  'user_employer', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: 'modified'
  });

  return UserEmployer;
}

module.exports = Model;
