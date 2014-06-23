'use strict';

/* jshint camelcase: false */

var path        = require('path');
var express     = require('express');
var controller  = express.Router();
var passport    = require('passport');

var models = require(path.join(__dirname, '..', 'models'));

var strategies  = require(path.join(__dirname, 'auth', 'strategies'));

/**
 * Serializes user for passport
 *
 * @param  {Object}   user User's object
 * @param  {Function} done Callback function
 * @return {Function}      Returns callback function
 * @api public
 */

function serialize(user, done) {
  done(null, user.id);
}
passport.serializeUser = exports.serialize = serialize;

/**
 * Deserializes user for passport
 *
 * @param  {Integer}   id  User's ID
 * @param  {Function} done Callback funcion
 * @return {Funcion}       Returns callback function
 * @api public
 */

function deserialize(id, req, done) {
  models.User.find({
    attributes: ['id', 'first_name', 'last_name', 'type', 'auth_user_key'],
    where: {id: parseInt(id, 10)}
  }).complete(function (err, user) {
    done(null, user);
  });
}
passport.deserializeUser = exports.deserialize = deserialize;

// middleware for google strategy
controller.use(function (req, res, next) {
  if (req.url.indexOf('google') > -1) {
    passport.use(strategies.google);
  }

  if (req.url.indexOf('facebook') > -1) {
    passport.use(strategies.facebook);
  }

  if (req.url.indexOf('twitter') > -1) {
    passport.use(strategies.twitter);
  }

  next();
});

controller
  .route('/email')
  .get(passport.authenticate('local'));

controller
  .route('/email/callback')
  .get(passport.authenticate('local', {
    failureRedirect: '/'
  }), function (req, res) {
    req.flash('success', 'You have successfully logged in.');
    res.redirect('/');
  });

controller
  .route('/google')
  .get(passport.authenticate('google', {
    scope: ['email']
  }));

controller
  .route('/google/callback')
  .get(passport.authenticate('google', {
    failureRedirect: '/'
  }), function (req, res) {
    req.flash('success', 'You have successfully logged in.');
    res.redirect('/');
  });

controller
  .route('/facebook')
  .get(passport.authenticate('facebook', {
    scope: ['email', 'user_likes']
  }));

controller
  .route('/facebook/callback')
  .get(passport.authenticate('facebook', {
    failureRedirect: '/'
  }), function (req, res) {
    req.flash('success', 'You have successfully logged in.');
    res.redirect('/');
  });

controller
  .route('/twitter')
  .get(passport.authenticate('twitter', {}));

controller
  .route('/twitter/callback')
  .get(passport.authenticate('twitter', {
    failureRedirect: '/'
  }), function (req, res) {
    req.flash('success', 'You have successfully logged in.');
    res.redirect('/');
  });

module.exports = ['/auth', controller];
