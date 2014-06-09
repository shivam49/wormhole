'use strict';

var path      = require('path');
var utils     = require(path.join('..', '..', 'utils'));
var Sequelize = require('sequelize');
var db        = {};

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

utils.bootstrap(__dirname).forEach(load);

Object.keys(db).forEach(function (modelName) {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
