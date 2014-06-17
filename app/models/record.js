'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var Record = sequelize.define('Record', {
    id_record: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    action: {
      type: DataType.STRING
    },
    articleHash: {
      type: DataType.STRING
    },
    id_user: {
      type: DataType.STRING
    },
    created_at: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    }
  }, {
    classMethods: {
      // associate: function(models) {
      // }
    },
    tableName:  'record', // defaults to plural form
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false
  });

  return Record;
}

module.exports = Model;
