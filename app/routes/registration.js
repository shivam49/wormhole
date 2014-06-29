
/* jshint camelcase: false */
var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var bcrypt = require('bcrypt');

exports.get = function(req, res) {
  res.render('registration');
};

exports.post = function(req, res, next) {
  if (!_.isString(req.body.first_name) || _.isEmpty(req.body.first_name.trim())) {
    return next(new Error('You must enter in a first name.'));
  }

  if (!_.isString(req.body.last_name) || _.isEmpty(req.body.last_name.trim())) {
    return next(new Error('You must enter in a last name.'));
  }

  if (!_.isString(req.body.email) || _.isEmpty(req.body.email.trim())) {
    return next(new Error('You must enter in a email.'));
  }

  if (!_.isString(req.body.password) || _.isEmpty(req.body.password.trim())) {
    return next(new Error('You must enter in a password.'));
  }

  if (req.body.password !== req.body.password_confirm) {
    return next(new Error('You must confirm your password correctly.'));
  }

  if (req.body.password.length < 6) {
    return next(new Error('Your password must be at least six (6) characters long.'));
  }

  // check for "@" and "." if so it's an email
  if (req.body.email.indexOf('@') === -1 && req.body.email.indexOf('.') === -1) {
    return next(new Error('You must enter in a valid email address.'));
  }

  if (!_.isString(req.body.gender) || ['Male', 'Female'].indexOf(req.body.gender) === -1) {
    return next(new Error('Invalid entry for gender.'));
  }

  if (!_.isString(req.body.dob) || _.isEmpty(req.body.dob.trim()) || !moment(req.body.dob.trim()).isValid()) {
    return next(new Error('Your date of birth is invalid.'));
  }

  if (!_.isString(req.body.education) || _.isEmpty(req.body.education.trim())) {
    return next(new Error('You must enter in an education.'));
  }

  if (!_.isString(req.body.work) || _.isEmpty(req.body.work.trim())) {
    return next(new Error('You must enter in your work/occupation.'));
  }

  if (!_.isString(req.body.position) || _.isEmpty(req.body.position.trim())) {
    return next(new Error('You must enter in a work/occupation position.'));
  }

  checkUserName();

  var User;
  var token;
  var userNamePassport;

  function login(userId) {
    req.db.get(['users', userId]).then(function (user) {
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }

        res.redirect('/');
      });
    }, next);
  }

  function findUserPassports() {
    return req.db.find('user passports', {
      method: 'email',
      token: req.body.email
    });
  }

  function findOrCreate(userPassports) {
    if (!userPassports || !userPassports.length) {
      return createUser();
    }

    req.db.remove(['user passports', userNamePassport._id]);

    return next(new Error('This e-mail address already exists.'));
  }

  function checkUserName() {
    if (!(_.isString(req.body.username) && !_.isEmpty(req.body.username.trim()))) {
      return findUserPassports().then(findOrCreate);
    }

    req.db.find('user passports', {
      method: 'username',
      token: req.body.username.toLowerCase()
    }).then(function (userPassport) {
      if (userPassport && userPassport.length > 0 && !_.isUndefined(userPassport[0]._id)) {
        return next(new Error('This username already exists.'));
      }

      userNamePassport = req.db.create('user passports', {
        method: 'username',
        token: req.body.username.toLowerCase()
      });

      findUserPassports().then(findOrCreate);
    });
  }

  function password(pass, callback) {
    bcrypt.genSalt(12, function (err, salt){
      bcrypt.hash(pass, salt, callback);
    });
  }

  function createUser() {
    var fname   = req.body.first_name;
    var lname   = req.body.last_name;
    var emails  = req.body.email;
    var id;

    req.db.create('users', {
      first_name: fname,
      last_name: lname
    }).then(function (user) {
      User = user;

      var userId = User;
      id = userId;

      password(req.body.password, function (err, _token) {
        if (err) {
          return next(err);
        }

        token = _token;
        req.db.create('user passports', {
          user_id: userId,
          method: 'email',
          token: req.body.email,
          secret: token,
          email: Array.isArray(emails) && emails.length > 0 && !_.isEmpty(emails[0].trim()) ? emails[0] : ''
        });

        if (!(_.isString(req.body.username) && !_.isEmpty(req.body.username.trim()))) {
          return createAttributes(id);
        }

        req.db.put(['user passports', userNamePassport._id, 'secret'], _token);
        createAttributes(id);
      });
    });
  }

  function createAttributes(id) {
    var date = moment(req.body.dob.trim());

    // very important to not change the order of operations
    // within chainer... unless you change the complete function

    var data = {};

    if (moment(date).isValid()) {
      data.dob = {
        day: parseInt(date.format('D'), 10),
        month: parseInt(date.format('M'), 10),
        year: parseInt(date.format('YYYY'), 10)
      };
    }

    data.position = req.body.position.trim();
    data.education = req.body.education.trim();
    data.work = req.body.work.trim();

    async.each(Object.keys(data), function (key, fn) {
      req.db.put(['users', User, key], data[key]).then(function() {
        fn();
      }, fn);
    }, function (err) {
      if (err) {
        return next(err);
      }

      login(id);
    });
  }
};
