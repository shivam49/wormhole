'use strict';

/* jshint camelcase: false */

var path   = require('path');
var Utils  = require(path.resolve([__dirname, '..', '..', 'node_modules', 'sequelize', 'lib', 'utils'].join(path.sep)));
var moment = require('moment');
var _      = require('lodash');

module.exports = function(sequelize, DataTypes) {
  var users = sequelize.import(path.resolve(path.join(__dirname, 'user')));

  var UserPassports = sequelize.define('UserPassports', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    method: DataTypes.STRING,
    token: DataTypes.STRING,
    secret: DataTypes.STRING,
    reset_key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email: {
      type: DataTypes.STRING,
      defaultValue: ''
    }
  }, {
    tableName: 'user_passports',
    classMethods: {
      associate: function(models) {
        UserPassports.belongsTo(models.User, {foreignKey: 'user_id'});
      },
      remove: function(userId) {
        var self = this;

        return new Utils.CustomEventEmitter(function (emitter) {
          var chain = new Utils.QueryChainer();

          users.find({attributes: ['type'], where: parseInt(userId, 10)}).complete(function (err, user) {
            if (err) {
              return emitter.emit('error', err);
            }

            if (user.isAdmin() === true) {
              return emitter.emit('error', 'You can\'t delete an administrative account.');
            }

            chain.add(self.destroy({user_id: userId}));
            chain.add(users.destroy({user_id: userId}));
            chain.run().proxy(emitter);
          });
        }).run();
      },
      registerWithEmail: function(options, callback) {
        var self = this;

        var fName = (options.first_name || '').trim();
        var lName = (options.last_name || '').trim();
        var email = (options.email || '').trim();
        var password = (options.password || '').trim();
        var errors = {};

        if (!_.isString(fName) || _.isEmpty(fName)) {
          errors.first_name = errors.first_name || [];
          errors.first_name.push('First name must not be empty.');
        }

        if (!_.isString(lName) || _.isEmpty(lName)) {
          errors.last_name = errors.last_name || [];
          errors.last_name.push('Last name must not be empty.');
        }

        if (!_.isString(email) || _.isEmpty(email)) {
          errors.email = errors.email || [];
          errors.email.push('Email must not be empty.');
        }

        if (email.indexOf('@') === -1) {
          errors.email = errors.email || [];
          errors.email.push('Email is invalid.');
        }

        if (!password) {
          errors.password = errors.password || [];
          errors.password.push('Password must not be empty.');
        }

        if (Object.keys(errors).length > 0) {
          return callback(errors, null);
        }

        self.find({where: ['method=? AND lower(token)=?', 'email', email]}).complete(function (err, user_passport) {
          if (err) {
            return callback(err);
          }

          if (user_passport) {
            return callback({email: ['This email address already exists.']});
          }

          users.create({first_name: fName, last_name: lName}).complete(function (err, user) {
            if (err) {
              return callback(err);
            }

            self.create({
              user_id: user.user_id, method: 'email', token: email
            }).complete(function (err, userPassport) {
              if (err) {
                return callback(err);
              }

              sequelize.query(
                'UPDATE user_passports SET secret=crypt(?, gen_salt(\'bf\', 10)) WHERE id=?',
                { raw: true, plain: true },
                [password, userPassport.id]
              ).complete(function (err) {
                callback(err, user);
              });
            });
          });
        });
      },
      loginWithEmail: function(options, callback) {
        this.find({
          where: ['method=? AND lower(token)=?', 'email', options.email.toString().toLowerCase()],
          include: [users]
        })
        .complete(function (err, result) {
          if (err) {
            return callback(err);
          }

          if (result === null) {
            return callback(false, null);
          }

          sequelize.query(
            'SELECT (secret = crypt(?, secret)) AS pswmatch FROM user_passports WHERE id=?', null,
            { raw: true, plain: true },
            [options.password, result.id]
          ).complete(function (err, query) {
            if (err) {
              return callback(err);
            }

            if (query.pswmatch !== true) {
              return callback(null, false, { message: 'Invalid username/password combination.' });
            }

            callback(null, result.user);
          });
        });
      }
    },
    instanceMethods: {
      forgotPassword: function() {
        var self = this;
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var i = 0;

        for (i=0;i<20;i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return new Utils.CustomEventEmitter(function (emitter) {
          var chain = new Utils.QueryChainer();
          // var link  = (config.protocol || 'https') + '://' + config.domain + '/password/' + self.token + '/' + text;

          var futureDate = moment().add('hours', 72).toISOString();
          chain.add(self.updateAttributes({reset_key: text, reset_date: futureDate}));
          // chain.add(emailQueue.queue('password_reset', {to: self.token}, {key: text, reset_link: link}, sendNow));
          chain.run().complete(function (err) {
            if (err) {
              return emitter.emit('error', err);
            }

            emitter.emit('success');
          });
        }).run();
      }
    }
  });

  return UserPassports;
};
