'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var School = sequelize.define('School', {
    id_school: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    school: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        School.belongsTo(models.UserSchool, {foreignKey: 'fk_id_school'});
      }
    },
    tableName:  'school', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return School;
}

module.exports = Model;
