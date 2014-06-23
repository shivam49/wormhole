/* jshint camelcase: false */

var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy  = require('passport-twitter');
var async            = require('async');

var path = require('path');

var models  = require(path.join(__dirname, '..', '..', 'models'));
var config  = require(path.join(__dirname, '..', '..', '..', 'config'));

exports.local = (function() {
  return new LocalStrategy(
    {usernameField: 'email'},
    function (email, password, done) {
      models.UserPassports.loginWithEmail({email: email, password: password}, login);

      function login(err, user) {
        if (!user || !!err || err === false) {
          return done(null, false, {message: 'This email/password combination doesn\'t exist.'});
        }

        done(null, user);
      }
    }
  );
})();

exports.twitter = (function() {
  return new TwitterStrategy({
      clientID:     config.twitter.id,
      clientSecret: config.twitter.secret,
      callbackURL:  config.twitter.callbackUrl
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(twitterLogin);

      function twitterLogin() {
        var fname   = profile.name.givenName;
        var lname   = profile.name.familyName;

        async.waterfall([
          // See if this person already has a passport
          function (callback) {
            models.UserPassports.find({where: {method: 'twitter', token: profile.id}}).success(function (passport) {
              callback(null, passport);
            }).error(callback);
          },
          // Search through the facebook profile's emails to see if we have an existing user_id with this person
          // If we don't, then simply create a new one and pass that new id
          function (passport, callback) {
            if (passport !== null) {
              hasUser();
            } else {
              createUser();
            }

            function hasUser() {
              models.User.find({where: {id: passport.user_id}}).success(function (user) {
                callback(null, passport, user);
              }).error(callback);
            }

            function createUser() {
              models.User.create({
                first_name: fname, last_name: lname
              }).success(function (user) {
                callback(null, passport, user);
              }).error(callback);
            }
          },
          // Create a new passport entry (or just select it) and mark all new emails as inactive
          function (passport, user, callback) {
            var id = (!!passport && passport.user_id) || (!!user && user.id) || 0;

            if (!id || id === 0) {
              return callback('No user created');
            }

            models.UserPassports.findOrCreate({
              user_id: id,
              method: 'twitter',
              token: profile.id
            }, {
              user_id: id,
              method: 'twitter',
              token: profile.id
            }).success(function (passport) {
              passport.updateAttributes({
                user_id: user.id,
                secret: accessToken
              }).success(function() {
                callback(null, user);
              }).error(callback);
            });
          }
        ], done);
      }
    }
  );
})();

exports.google = (function() {
  return new GoogleStrategy({
      clientID:     config.google.id,
      clientSecret: config.google.secret,
      callbackURL:  config.google.callbackUrl
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(googleLogin);

      function googleLogin() {
        var fname   = profile.name.givenName;
        var lname   = profile.name.familyName;
        var emails  = (profile.emails || [{value: ''}]).map(function (e) { return e.value; });

        async.waterfall([
          // See if this person already has a facebook passport
          function (callback) {
            models.UserPassports.find({where: {method: 'google', token: profile.id}}).success(function (passport) {
              callback(null, passport);
            }).error(callback);
          },
          // Search through the facebook profile's emails to see if we have an existing user_id with this person
          // If we don't, then simply create a new one and pass that new id
          function (passport, callback) {
            models.UserPassports.all({
              attributes: ['id', 'token', 'user_id'],
              where: {method: 'email', token: emails}
            }).complete(findPassport);

            function findPassport(err, users) {
              if (err) {
                return callback(err);
              }

              // Let's find any differences between the currently
              // fetched emails and the ones we already have stored in our db...
              var currentEmails = (users || []).map(function (u) { return u.token; });
              var newEmails     = emails.filter(function (e) { return currentEmails.indexOf(e) === -1; });

              if (users !== null && users.length > 0) {
                hasUser();
              } else {
                createUser();
              }

              function hasUser() {
                models.User.find({where: {id: users[0].id}}).success(function (user) {
                  callback(null, passport, user, newEmails);
                }).error(callback);
              }

              function createUser() {
                models.User.create({
                  first_name: fname, last_name: lname
                }).success(function (user) {
                  callback(null, passport, user, newEmails);
                }).error(callback);
              }
            }
          },
          // Create a new passport entry (or just select it) and mark all new emails as inactive
          function (passport, user, newEmails, callback) {
            var id = (!!passport && passport.user_id) || (!!user && user.id) || 0;

            if (!id || id === 0) {
              return callback('No user created');
            }

            models.UserPassports.findOrCreate({
              user_id: id,
              method: 'google',
              token: profile.id
            }, {
              user_id: id,
              method: 'google',
              token: profile.id
            }).success(function (passport) {
              passport.updateAttributes({
                user_id: user.id,
                secret: accessToken,
                email: newEmails[0]
              }).success(function() {
                callback(null, user);
              }).error(callback);
            });
          }
        ], done);
      }
    }
  );
})();

exports.facebook = (function() {
  return new FacebookStrategy({
      clientID:     config.facebook.id,
      clientSecret: config.facebook.secret,
      callbackURL:  config.facebook.callbackUrl
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(facebookLogin);

      function facebookLogin() {
        var fname   = profile.name.givenName;
        var lname   = profile.name.familyName;
        var emails  = (profile.emails || [{value: ''}]).map(function (e) { return e.value; });

        async.waterfall([
          // See if this person already has a facebook passport
          function (callback) {
            models.UserPassports.find({where: {method: 'facebook', token: profile.id}}).success(function (passport) {
              callback(null, passport);
            }).error(callback);
          },
          // Search through the facebook profile's emails to see if we have an existing user_id with this person
          // If we don't, then simply create a new one and pass that new id
          function (passport, callback) {
            models.UserPassports.all({
              attributes: ['id', 'token', 'user_id'],
              where: {method: 'email', token: emails}
            }).complete(findPassport);

            function findPassport(err, users) {
              if (err) {
                return callback(err);
              }

              // Let's find any differences between the currently
              // fetched emails and the ones we already have stored in our db...
              var currentEmails = (users || []).map(function (u) { return u.token; });
              var newEmails     = emails.filter(function (e) { return currentEmails.indexOf(e) === -1; });

              if (users !== null && users.length > 0) {
                hasUser();
              } else {
                createUser();
              }

              function hasUser() {
                models.User.find({where: {id: users[0].id}}).success(function (user) {
                  callback(null, passport, user, newEmails);
                }).error(callback);
              }

              function createUser() {
                models.User.create({
                  first_name: fname, last_name: lname
                }).success(function (user) {
                  callback(null, passport, user, newEmails);
                }).error(callback);
              }
            }
          },
          // Create a new passport entry (or just select it) and mark all new emails as inactive
          function (passport, user, newEmails, callback) {
            var id = (!!passport && passport.user_id) || (!!user && user.id) || 0;

            if (!id || id === 0) {
              return callback('No user created');
            }

            models.UserPassports.findOrCreate({
              user_id: id,
              method: 'facebook',
              token: profile.id
            }, {
              user_id: id,
              method: 'facebook',
              token: profile.id
            }).success(function (passport) {
              passport.updateAttributes({
                user_id: user.id,
                secret: accessToken,
                email: newEmails[0]
              }).success(function() {
                callback(null, user);
              }).error(callback);
            });
          }
        ], done);
      }
    }
  );
})();
