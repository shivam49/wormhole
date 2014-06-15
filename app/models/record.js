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
    }
  }, {
    classMethods: {
      // associate: function(models) {
      // }
    },
    tableName:  'record', // defaults to plural form
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Record;
}

module.exports = Model;
