
/* jshint camelcase: false */

var passport = require('passport');
var path = require('path');
// var localStrategy = require(path.join(__dirname, 'auth', 'local')).localStrategy;

var strategies  = require(path.join(__dirname, 'auth', 'strategies'));

exports.facebook = passport.authenticate('facebook', {scope: ['email', 'user_about_me']});

exports.login = function(req, res, next) {
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
};

exports.splash = function(req, res) {
  res.render('splash');
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};
