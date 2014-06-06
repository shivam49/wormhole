'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var DOB = sequelize.define('DOB', {
    id_dob: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    day: {
      type: DataType.INTEGER
    },
    month: {
      type: DataType.INTEGER
    },
    year: {
      type: DataType.INTEGER
    }
  }, {
    classMethods: {
      associate: function(models) {
        DOB.belongsTo(models.User_Name, {foreignKey: 'fk_id_username'});
      }
    },
    tableName:  'dob', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return DOB;
}

module.exports = Model;
