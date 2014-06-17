
/*jshint camelcase: false */

var express         = require('express');
var controller      = express.Router();
var path            = require('path');
var models          = require(path.join(__dirname, '..', '..', 'models'));
var config          = require(path.join(__dirname, '..', '..', '..', 'config'));
var passport        = require('passport');
var GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;

function googleStrategy() {
  function buildGoogleProfile(accessToken, refreshToken, profile, done) {
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

      findVerifier('google', function (err, verifier) {
        if (err) {
          return done(err);
        }

        models.UserEmail.findOrCreate({
          fk_id_user: user.id_user,
          fk_id_email: email.id_email,
          fk_id_verifier: verifier.id_verifier
        }).complete(function (err, userEmail) {
          var authProfile = {
            accessToken: accessToken,
            id: profile.id
          };

          userEmail.auth_profile = JSON.stringify(authProfile);

          userEmail.save(['auth_profile']).complete(function (err, userEmail) {
            if (err) {
              return done(err);
            }

            userEmail.user = user;
            populateNames(err, userEmail);
          });
        });
      });
    }

    function findVerifier(type, fn) {
      models.Verifier.findOrCreate({
        verifier: type
      }).complete(fn);
    }

    function findUser(email) {
      findVerifier('google', function (err, verifier) {
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

  return new GoogleStrategy({
    clientID:     config.google.id,
    clientSecret: config.google.secret,
    callbackURL:  config.google.callbackUrl
  }, buildGoogleProfile);
}

// middleware for google strategy
controller.use(function (req, res, next) {
  passport.use(googleStrategy());
  next();
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

module.exports = controller;
