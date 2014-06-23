
/* jshint camelcase: false */

var passport = require('passport');
var express = require('express');
var controller = express.Router();
var path = require('path');
// var localStrategy = require(path.join(__dirname, 'auth', 'local')).localStrategy;

var strategies  = require(path.join(__dirname, 'auth', 'strategies'));

exports.facebook = passport.authenticate('facebook', {scope: ['email', 'user_about_me']});

function login(req, res, next) {
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
    badRequestMessage: 'Missing email and/or password.'
  }, function (err, user, info) {
    if (err || !user) {
      return next(err || info.message);
    }

    strategies.loginUser(user, req, res, res.jsonDone);
  })(req, res, next);
}
exports.login = login;

controller.route('/logout')
.get(logOut);

controller.route('/login')
.get(function (req, res) {
  res.render('auth');
})
.post(login);

function logOut(req, res) {
  req.logout();
  res.redirect('/');
}

module.exports = ['/', controller];
