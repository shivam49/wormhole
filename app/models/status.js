'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Status = sequelize.define('Status', {
    id_status: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    status: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Status.belongsTo(models.UserStatus, {foreignKey: 'fk_id_status'});
      }
    },
    tableName:  'status', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return Status;
}

module.exports = Model;
