'use strict';

/* jshint camelcase: false */

var Hapi = require('hapi');

function Model(sequelize, DataType) {
  var User = sequelize.define('User', {
    id_user: {
      type:           DataType.INTEGER,
      primaryKey:     true,
      autoIncrement:  true
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.UserUsername, {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserDOB,      {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserName,     {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserEmail,    {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserSchool,   {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserEmployer, {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserPassword, {foreignKey: 'fk_id_user'});
        User.hasMany(models.UserStatus,   {foreignKey: 'fk_id_user'});
      },
      routes: function(models) {
        var routes = [];
        routes.push({
          method: 'GET',
          path: '/users',
          handler: function (request, reply) {
            models.User.all().success(reply)
            .error(function (err) {
              Hapi.error.internal(err);
            });
          }
        });

        return routes;
      }
    },
    tableName:  'user', // defaults to plural form
    underscored: true,
    createdAt: 'created',
    updatedAt: 'modified'
  });

  return User;
}

module.exports = Model;
