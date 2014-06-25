
var _         = require('lodash');
var fs        = require('fs');
var path      = require('path');
var camelCase = require('camel-case');
var routes    = {};

_.each(fs.readdirSync(__dirname).filter(removeIndex), populateRoute);

module.exports = routes;

// # private #

function populateRoute(route) {
  routes[camelCase(route.replace('.js', ''))] = require(path.join(__dirname, route));
}

function removeIndex(route) {
  return path.basename(route) !== 'index.js';
}
