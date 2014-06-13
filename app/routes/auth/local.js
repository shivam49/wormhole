
/*jshint camelcase: false */

// var express           = require('express');
// var controller        = express.Router();
var path              = require('path');
var models            = require(path.join(__dirname, '..', '..', 'models'));
// var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;

function localStrategy(username, password, done) {
  function buildLocalProfile(username, password, done) {
    // check for "@" and "." if so it's an email
    if (username.indexOf('@') > -1 && username.indexOf('.') > -1) {
      checkForEmail();
    } else {
      checkForUsername();
    }

    function checkForEmail() {
      models.Email.find({
        where: {
          email: username.toLowerCase()
        }
      }).complete(function (err, row) {
        if (err) {
          return done(err);
        }

        if (!row) {
          return done(null, false, { message: 'This login doesn\'t exist. Please try registering.' });
        }

        loginEmailAccount(row);
      });
    }

    function checkForUsername() {
      models.UserName.find({
        where: {
          username: username.toLowerCase()
        }
      }).complete(function (err, row) {
        if (err) {
          return done(err);
        }

        if (!row) {
          return done(null, false, { message: 'This login doesn\'t exist. Please try registering.' });
        }

        loginUserAccount(row);
      });
    }

    function loginEmailAccount(row) {
      models.UserEmail.find({
        where: {
          fk_id_email: row.id_email
        },
        include: [models.User]
      }).complete(function (err, userEmail) {
        if (err) {
          return done(err);
        }

        if (!userEmail) {
          return done(null, false, { message: 'Your account has been disabled.' });
        }

        models.sequelize.query(
          'SELECT (password = crypt(?, password)) AS pswmatch FROM user_email WHERE id_user_email=?', null,
          { raw: true, plain: true },
          [password, userEmail.id_user_email]
        ).complete(function (err, query) {
          checkForPassword(err, query, userEmail.user);
        });
      });
    }

    function loginUserAccount(row) {
      models.UserEmail.find({
        where: {
          fk_id_username: row.id_username
        },
        include: [models.User]
      }).complete(function (err, userEmail) {
        if (err) {
          return done(err);
        }

        if (!userEmail) {
          return done(null, false, { message: 'Your account has been disabled.' });
        }

        models.sequelize.query(
          'SELECT (password = crypt(?, password)) AS pswmatch FROM user_email WHERE id_user_email=?', null,
          { raw: true, plain: true },
          [password, userEmail.id_user_email]
        ).complete(function (err, query) {
          checkForPassword(err, query, userEmail.user);
        });
      });
    }

    function checkForPassword(err, query, user) {
      if (err) {
        return done(err);
      }

      if (query.pswmatch !== true) {
        return done(null, false, { message: 'Invalid username/password combination.' });
      }

      done(null, user);
    }
  }

  return new LocalStrategy(buildLocalProfile);
}
exports.localStrategy = localStrategy;

// middleware for strategy
// controller.use(function (req, res, next) {
//   passport.use(localStrategy());
//   next();
// });

// controller
//   .route('/local')
//   .get(function (req, res) {
//     res.json(true);
//   })
//   .post(passport.authenticate('local', {
//     failureFlash: true,
//     failureRedirect: '/login'
//   }), function (req, res) {
//     res.redirect('/');
//   });

// module.exports = controller;
