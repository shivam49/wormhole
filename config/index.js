'use strict';

var _         = require('lodash');
var path      = require('path');
var defaults  = require(path.join(__dirname, 'config.json'));
var config    = require(path.join(__dirname, (process.env.NODE_ENV || 'dev') + '.json'));

module.exports = _.extend(config, defaults);
