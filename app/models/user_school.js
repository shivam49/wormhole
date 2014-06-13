'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserSchool = sequelize.define('UserSchool', {
    id_user_school: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references: 'user',
      referencesKey: 'id_user'
    },
    fk_id_school: {
      type: DataType.INTEGER,
      references: 'school',
      referencesKey: 'id_school'
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserSchool.hasMany(models.School, {foreignKey: 'id_school'});
      }
    },
    tableName:  'user_school', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserSchool;
}

module.exports = Model;
