
/* jshint camelcase: false */

'use strict';

var http = require('http');
http.globalAgent.maxSockets = http.globalAgent.maxSockets + 1000;

var _                 = require('lodash');
var util              = require('util');
var path              = require('path');
var express           = require('express');
var models            = require(path.join(__dirname, 'app', 'models'));
var app               = express();

app = require(path.join(__dirname, 'lib', 'configure'))(app);

// load the controllers
app = require(path.join(__dirname, 'routes'))(app);

app.use(function (err, req, res, next) {
  // set default error status code
  res.statusCode = (_.isNumber(err.status)) ? err.status : 500;

  if (!_.isString(err.message)) {
    err.message = 'An unknown error has occured, please try again';
  }

  // if we pass an error object, then we want to simply return the message...
  // if we pass an object, then we want to do a stack trace, and then return the object + stack
  var error = {};

  // set error type
  error.type = _.isString(err.param) ? 'invalid_request_error' : 'api_error';

  // set error message and stack trace
  if (util.isError(err)) {
    error.message = err.message;
  } else {
    _.extend(error, err);
  }

  error.stack = _.isUndefined(err.stack) ? new Error(err.message).stack : err.stack;

  // set error level
  var level = (res.statusCode < 500) ? 'warning' : 'error';

  // if we have a mongoose validation err
  // then we know to output all the errors
  if (_.isObject(error.errors) && !_.isEmpty(error.errors)) {
    var messages = [];
    _.each(error.errors, function(errMsg) {
      if (_.isString(errMsg.message)) {
        messages.push(errMsg.message);
      }
    });

    if (!_.isEmpty(messages)) {
      error.message = messages.join(' ');
    }
  }

  console.error(error.message);
  console.error(error.stack);

  res.format({
    text: function() {
      res.send(error.message);
    },
    html: function() {
      req.flash(level, error.message);
      res.redirect('back');
    },
    json: function() {
      res.json({ error: error });
    }
  });
});

if (!module.parent) {
  var port = process.env.PORT || 8000;

  app.listen(port);

  if (process.send) {
    process.send('online');
  }

  console.log('Server has started on port ' + port + '.');
} else {
  // for mocha
  module.exports = app;
}

// for naught
process.on('message', function (message) {
  if (message === 'shutdown') {
    app.close(function () {
      process.exit(0);
    });

    setTimeout(function () {
      process.exit(0);
    }, 10 * 1000);
  }
});

