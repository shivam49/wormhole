'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Password = sequelize.define('Password', {
    id_password: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    password: {
      type: DataType.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Password.belongsTo(models.UserPassword, {
          foreignKey: 'fk_id_password'
        });
      }
    },
    tableName:  'password', // defaults to plural form
    underscored: true,
    createdAt: false,
    updatedAt: false
  });

  return Password;
}

module.exports = Model;
