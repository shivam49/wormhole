'use strict';

var path      = require('path');
var utils     = require(path.join(__dirname, 'utils'));
var Sequelize = require('sequelize');
var db        = {};

exports.register = function (plugin, options, next) {
  function success() {
    plugin.bind({
      db: db
    });
    next();
  }

  function error(err) {
    plugin.hapi.error.internal('Database error', { error: err });
  }

  var sequelize = new Sequelize(
    process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
    dialect: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    logging: (process.env.NODE_ENV === 'dev' ? console.logging : false)
  });

  function load(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  }

  utils
    .bootstrap(__dirname)
    .forEach(load);

  // create the associations and routes
  Object.keys(db).forEach(function (modelName) {
    if (typeof db[modelName].associate === 'function') {
      db[modelName].associate(db);
    }

    if (typeof db[modelName].routes === 'function') {
      db[modelName].routes(db).forEach(plugin.route);
    }
  });

  // helpers
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;

  sequelize.sync({ force: true })
  .success(success)
  .error(error);
};

exports.register.attributes = {
  pkg: require('./package.json')
};

