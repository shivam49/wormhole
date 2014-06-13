
/*jshint camelcase: false */

var express           = require('express');
var controller        = express.Router();
var path              = require('path');
var models            = require(path.join(__dirname, '..', '..', 'models'));
var passport          = require('passport');
var LocalStrategy     = require('passport-local');

function localStrategy(username, password, done) {
  // check for "@" and "." if so it's an email
  if (username.indexOf('@') > -1 && username.indexOf('.') > -1) {
    checkForEmail();
  } else {
    checkForUsername();
  }

  function checkForEmail() {
    models.Email.find({
      email: username.toLowerCase()
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
    models.UserName.findOne({
      username: username.toLowerCase()
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
        fk_id_email: row.email
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
        checkForPassword(err, query, row.user);
      });
    });
  }

  function loginUserAccount(row) {
    models.UserEmail.find({
      where: {
        fk_id_username: row.username
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
        checkForPassword(err, query, row.user);
      });
    });
  }

  function checkForPassword(err, query, user) {
    if (err) {
      return done(err);
    }

    console.log('match', query.pswmatch);
    if (query.pswmatch !== true) {
      return done(null, false, { message: 'Invalid username/password combination.' });
    }

    done(null, user);
  }
}

// middleware for strategy
controller.use(function (req, res, next) {
  passport.use(new LocalStrategy(localStrategy));
  next();
});

controller
  .route('/local')
  .post(passport.authenticate('local', {
    failureFlash: true
  }), function (req, res) {
    res.redirect('/');
  });

module.exports = controller;
