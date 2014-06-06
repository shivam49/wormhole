'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Employer = sequelize.define('Employer', {
    id_employer: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    employer: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Employer.belongsTo(models.UserEmployer, {
          foreignKey: 'fk_id_employer'
        });
      }
    },
    tableName:  'employer', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return Employer;
}

module.exports = Model;
