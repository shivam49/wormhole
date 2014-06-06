'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Verifier = sequelize.define('Verifier', {
    id_verifier: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    verifier: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Verifier.belongsTo(models.UserEmail, {foreignKey: 'fk_id_verifier'});
      }
    },
    tableName:  'verifier', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return Verifier;
}

module.exports = Model;
