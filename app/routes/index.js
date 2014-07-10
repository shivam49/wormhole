
var _         = require('lodash');
var fs        = require('fs');
var path      = require('path');
var camelCase = require('camel-case');
var routes    = {};

_.each(fs.readdirSync(__dirname).filter(dotFile).filter(removeIndex), populateRoute);

module.exports = routes;

// # private #

function populateRoute(route) {
  routes[camelCase(route.replace('.js', ''))] = require(path.join(__dirname, route));
}

function dotFile(filename) {
  return filename.indexOf('.') !== 0;
}

function removeIndex(route) {
  return path.basename(route) !== 'index.js';
}
