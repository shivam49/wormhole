'use strict';

/* jshint camelcase: false */

function Model(sequelize, DataType) {
  var UserName = sequelize.define('User_Name', {
    id_user_name: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    },
    fk_id_user: {
      type: DataType.INTEGER,
      references: 'user',
      referencesKey: 'id_user'
    },
    fk_id_usernames: {
      type: DataType.INTEGER,
      references: 'usernames',
      referencesKey: 'id_name'
    }
  }, {
    classMethods: {
      associate: function(models) {
        UserName.hasMany(models.UserNames, {foreignKey: 'id_name'});
      }
    },
    tableName:  'user_name', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return UserName;
}

module.exports = Model;
