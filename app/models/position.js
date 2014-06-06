'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Position = sequelize.define('Position', {
    id_position: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    position: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Position.belongsTo(models.UserEmployer, {
          foreignKey: 'fk_id_position'
        });
      }
    },
    tableName:  'position', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return Position;
}

module.exports = Model;
