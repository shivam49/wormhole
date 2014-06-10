'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Email = sequelize.define('Email', {
    id_email: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    email: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Email.belongsTo(models.UserEmail, {foreignKey: 'id_email'});
      }
    },
    tableName:  'email', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return Email;
}

module.exports = Model;
