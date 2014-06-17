
/*jshint camelcase: false */

var express           = require('express');
var controller        = express.Router();
var path              = require('path');
var models            = require(path.join(__dirname, '..', '..', 'models'));
var config            = require(path.join(__dirname, '..', '..', '..', 'config'));
var passport          = require('passport');
var FacebookStrategy  = require('passport-facebook');

function facebookStrategy() {
  function buildFacebookProfile(accessToken, refreshToken, profile, done) {
    var email;

    // check for an email first
    if (!Array.isArray(profile.emails) ||
        profile.emails.length < 1 ||
        typeof profile.emails[0].value !== 'string') {
      return done('No emails found.');
    }

    // findOrCreate email entry
    models.Email.findOrCreate({
      email: profile.emails[0].value
    }).complete(findUserId);

    function findUserId(err, _email) {
      if (err) {
        return done(err);
      }

      email = _email;

      if (email.isNewRecord) {
        createUser();
      } else {
        findUser(email);
      }
    }

    function createUser() {
      models.User.create({}).complete(associateEmail);
    }

    // create UserEmail with a new user
    function associateEmail(err, user) {
      if (err) {
        return done(err);
      }

      findVerifier('facebook', function (err, verifier) {
        if (err) {
          return done(err);
        }

        var authProfile = {
          accessToken: accessToken,
          id: profile.id
        };

        models.UserEmail.findOrCreate({
          fk_id_user: user.id,
          fk_id_email: email.id,
          fk_id_verifier: verifier.id,
          auth_profile: JSON.stringify(authProfile)
        }).complete(function (err, userEmail) {
          userEmail.user = user;
          populateNames(err, userEmail);
        });
      });
    }

    function findVerifier(type, fn) {
      models.Verifier.findOrCreate({
        verifier: type
      }).complete(fn);
    }

    function findUser(email) {
      findVerifier('facebook', function (err, verifier) {
        if (err) {
          return done(err);
        }

        models.UserEmail.find({
          where: {
            fk_id_email: email.id,
            fk_id_verifier: verifier.id
          },
          include: [models.User]
        }).complete(function (err, userEmail) {
          if (err) {
            return done(err);
          }

          if (!userEmail) {
            return createUser();
          }

          populateNames(null, userEmail);
        });
      });
    }

    function populateNames(err, userEmail) {
      if (err) {
        return done(err);
      }

      models.UserName.findOrCreate({
        id_username: userEmail.fk_id_user,
        name_first: profile.name.givenName,
        name_last: profile.name.familyName
      }).complete(function (err) {
        done(err, userEmail.user);
      });
    }
  }

  return new FacebookStrategy({
    clientID:     config.facebook.id,
    clientSecret: config.facebook.secret,
    callbackURL:  config.facebook.callbackUrl
  }, buildFacebookProfile);
}

// middleware for google strategy
controller.use(function (req, res, next) {
  passport.use(facebookStrategy());
  next();
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

module.exports = controller;
