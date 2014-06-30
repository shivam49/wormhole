'use strict';

var _      = require('lodash');
var path   = require('path');
var routes = require(path.join(__dirname, 'app', 'routes'));
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;
var passport = require('passport');

module.exports = function(app) {
  // # authentication routes (make sure this is before /splash)

  app.get('/splash', function (req, res, next) {
    if (_.isString(req.cookies.seenSplash)) {
      return res.redirect('/');
    }

    ensureLoggedOut('/')(req, res, next);
  }, routes.home.splash);

  // google oauth
  app.get('/auth/google', ensureLoggedOut('/'), passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/auth/google/callback', ensureLoggedOut('/'), passport.authenticate('google', {
    successFlash: true,
    successReturnToOrRedirect: '/',
    failureFlash: true,
    failureRedirect: '/'
  }));

  // facebook oauth
  app.get('/auth/facebook', ensureLoggedOut('/'), passport.authenticate('facebook', {
    scope: ['email', 'user_likes']
  }));

  app.get('/auth/facebook/callback', ensureLoggedOut('/'), passport.authenticate('facebook', {
    successFlash: true,
    successReturnToOrRedirect: '/',
    failureFlash: true,
    failureRedirect: '/'
  }));

  // twitter oauth
  app.get('/auth/twitter', ensureLoggedOut('/'), passport.authenticate('twitter'));

  app.get('/auth/twitter/callback', ensureLoggedOut('/'), passport.authenticate('twitter', {
    successFlash: true,
    successReturnToOrRedirect: '/',
    failureFlash: true,
    failureRedirect: '/'
  }));

  // # logging in
  app.get('/logout', ensureLoggedIn('/splash'), function (req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });

  app.post('/login', ensureLoggedOut('/'), passport.authenticate('local', {
    successFlash: true,
    successReturnToOrRedirect: '/',
    failureFlash: true,
    failureRedirect: '/'
  }));

  // # registration
  app.get('/registration', ensureLoggedOut('/'), routes.registration.get);
  app.post('/registration', ensureLoggedOut('/'), routes.registration.post);

  // catch all
  app.all('*', function (req, res, next) {
    // if we have the seenSplash cookie.. just pass through
    if (_.isString(req.cookies.seenSplash)) {
      return next();
    }

    // otherwise, we should enforce splash if they're not logged in
    ensureLoggedIn('/splash')(req, res, next);
  });

  // # articles and main page
  ['/', '/news', '/entertainment', '/politics', '/sports', '/edutech', '/business', '/lifestyle'].forEach(articlePage);
  app.post('/', routes.articles.create);
  app.get('/article/:article', routes.articles.retrieve);

  // # inbox
  app.get('/inbox', routes.inbox.index);

  // # lumberyard
  app.get('/lumberyard', routes.lumberyard.index);

  // # notifications
  app.get('/notifications', routes.notifications.index);

  // # profile
  app.get('/profile', routes.profile.index);

  // # search
  app.get('/search', routes.search.index);
  app.get('/search/:words', routes.search.index);
  app.post('/search', routes.search.index);

  app.get('/eekoh', routes.eekoh.get);
  app.post('/eekoh', routes.eekoh.post);

  function articlePage(route) {
    app.get(route, routes.articles.index);
  }

  return app;
};
