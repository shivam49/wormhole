'use strict';

/* jshint camelcase: false */

var path        = require('path');
var express     = require('express');
var controller  = express.Router();
var passport    = require('passport');
var utils       = require(path.join(__dirname, '..', '..', 'utils'));

var models = require(path.join(__dirname, '..', 'models'));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  models.User.find(user.id_user).complete(done);
});

// load our strategies
utils.bootstrap(path.join(__dirname, 'auth')).forEach(function (file) {
  var ctrl = require(path.join(__dirname, 'auth', file));
  if (ctrl.stack) {
    controller.stack = controller.stack.concat(ctrl.stack);
  }
});

module.exports = ['/auth', controller];
