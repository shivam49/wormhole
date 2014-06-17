
/* jshint camelcase: false */

var _ = require('lodash');
var moment = require('moment');
var express = require('express');
var controller = express.Router();
var path = require('path');
var models = require(path.join(__dirname, '..', 'models'));

controller.route('/registration')
.get(function (req, res) {
  res.render('registration');
})
// todo:  move most of these validations straight into the models as well
//        we'll want still want to keep these here though before we even reach
//        sequelize/ORM lib
.post(function (req, res, next) {
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

  // this must be kept at the bottom / last validation
  if (_.isString(req.body.username) && !_.isEmpty(req.body.username.trim())) {
    return checkForUsername();
  }

  checkForEmail();

  function checkForEmail() {
    models.Email.find({
      email: req.body.username.toLowerCase()
    }).complete(function (err, row) {
      if (err) {
        return next(err);
      }

      if (row) {
        return next('This email address already exists. Please try logging in.');
      }

      createAccount();
    });
  }

  function checkForUsername() {
    models.UserName.find({
      username: req.body.username.toLowerCase()
    }).complete(function (err, row) {
      if (err) {
        return next(err);
      }

      if (row) {
        return next('This username already exists.');
      }

      createAccount();
    });
  }

  function createAccount() {
    var user;
    var email;

    createUser().complete(createEmail);

    function createEmail(err, _user) {
      if (err) {
        return next(err);
      }

      user = _user;

      models.Email.create({
        email: req.body.email.toLowerCase().trim()
      }).complete(createUserName);
    }

    function createUserName(err, _email) {
      if (err) {
        return next(err);
      }

      email = _email;

      if (_.isEmpty(req.body.username.trim())) {
        return createUserEmail();
      }

      models.UserName.create({
        username: req.body.username.toLowerCase().trim()
      }).complete(function (err, userName) {
        if (err) {
          return next(err);
        }

        models.UserUsername.create({
          fk_id_user: user.id_user,
          fk_id_username: userName.id_username
        }).complete(createUserEmail);
      });
    }

    function createUserEmail(err, userUserName) {
      var data = {
        fk_id_user: user.id_user,
        fk_id_email: email.id_email
      };

      if (!_.isUndefined(userUserName) && !_.isNull(userUserName)) {
        data.fk_id_username = userUserName.fk_id_username;
      }

      models.UserEmail.create(data).complete(function (err, userEmail) {
        if (err) {
          return next(err);
        }

        models.sequelize.query(
          'UPDATE user_email SET password=crypt(?, gen_salt(\'bf\', 10)) WHERE id_user_email=?',
          null,
          { raw: true },
          [req.body.password, userEmail.id_user_email]
        ).complete(createAttributes);
      });
    }

    function createAttributes(err) {
      if (err) {
        return next(err);
      }

      var chainer = new models.Sequelize.Utils.QueryChainer();
      var date = moment(req.body.dob.trim());

      // very important to not change the order of operations
      // within chainer... unless you change the complete function

      chainer.add(models.DOB.findOrCreate({
        day: parseInt(date.format('D'), 10),
        month: parseInt(date.format('M'), 10),
        year: parseInt(date.format('YYYY'), 10)
      }));

      chainer.add(models.Position.findOrCreate({
        position: req.body.position.trim()
      }));

      chainer.add(models.Employer.findOrCreate({
        employer: req.body.work.trim()
      }));

      chainer.add(models.School.findOrCreate({
        school: req.body.education.trim()
      }));

      chainer.add(models.UserNames.create({
        name_first: req.body.first_name.trim(),
        name_last: req.body.last_name.trim()
      }));

      chainer.run().complete(function (err, results) {
        // todo:  Since this isn't important.. we should eventually use some
        //        form of logging instead of straight up returning an error
        //        and just letting the user continue
        if (err) {
          return next(err);
        }

        var chainer2 = new models.Sequelize.Utils.QueryChainer();

        chainer2.add(models.UserDOB.create({
          fk_id_user: user.id_user,
          fk_id_dob: results[0].id_dob
        }));

        chainer2.add(models.UserEmployer.create({
          fk_id_user: user.id_user,
          fk_id_employer: results[2].id_employer,
          fk_id_position: results[1].id_position
        }));

        chainer2.add(models.UserSchool.create({
          fk_id_user: user.id_user,
          fk_id_school: results[3].id_school
        }));

        chainer2.add(models.User_Name.create({
          fk_id_user: user.id_user,
          fk_id_usernames: results[4].id_name
        }));

        chainer2.run().complete(response);
      });
    }

    function response(err) {
      if (err) {
        return next(err);
      }

      res.format({
        html: html,
        json: json
      });
    }

    function html() {
      req.flash('success', 'Your account has been created!');
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    }

    function json() {
      res.json(user);
    }
  }

  function createUser() {
    return models.User.create({});
  }
});

module.exports = ['/', controller];

