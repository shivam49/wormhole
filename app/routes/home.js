
/* jshint camelcase: false */

var passport = require('passport');
var _ = require('lodash');
var moment = require('moment');
var express = require('express');
var controller = express.Router();
var path = require('path');
var models = require(path.join(__dirname, '..', 'models'));
var localStrategy = require(path.join(__dirname, 'auth', 'local')).localStrategy;

controller.route('/logout')
.get(logOut);

controller.use('/login', useLocal);

controller.route('/login')
.get(login)
.post(passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
  }), function (req, res) {
    res.redirect('/');
});

function logOut(req, res) {
  req.logout();
  res.redirect('/');
}

function login(req, res) {
  res.render('auth');
}

function useLocal(req, res, next) {
  if (req.method !== 'POST') {
    return next();
  }

  passport.use(localStrategy());
  next();
}

module.exports = ['/', controller];
