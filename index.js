'use strict';

var _       = require('lodash');
var express = require('express');
var path    = require('path');
var _       = require('lodash');
var util    = require('util');
var server  = require(path.join(__dirname, 'server'));
var models  = require(path.join(__dirname, 'app', 'models'));
var app     = express();
var http    = require('http');

http.globalAgent.maxSockets = http.globalAgent.maxSockets + 1000;

// initialize the controllers
app = require(path.join(__dirname, 'app', 'routes'))(app);

function loadModels(fn) {
  // we'll want to get rid of force true eventually...
  // models.sequelize.sync({force: true}).complete(fn);
  fn();
}

function errorHandler(err, req, res, next) {
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

  if (error.type === 'invalid_request_error' && res.statusCode === 500) {
    res.statusCode = 400;
  }

  // set error message and stack trace
  if (util.isError(err)) {
    error.message = err.message;
  } else {
    _.extend(error, err);
  }

  // set status code for BadRequestError
  if (_.isString(error.name) && error.name === 'BadRequestError') {
    error.type = 'invalid_request_error';
    res.statusCode = 400;
    delete error.name;
  }

  error.stack = _.isUndefined(err.stack) ? new Error(err.message).stack : err.stack;

  // set error level
  var level = (res.statusCode < 500) ? 'warn' : 'error';

  // set error back to warning if it was warn
  // lib.logger level type = "warn"
  // req.flash messages type = "warning"
  if (level === 'warn') {
    level = 'warning';
  }

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
}

function notFoundHandler(req, res) {
  res.status(404).send('Not found');
}

function startServer(err) {
  if (err) {
    throw err;
  }

  var port = process.env.PORT || 8000;

  server.use(express.static('./public'));
  server.use('/', app);
  server.use(errorHandler);
  server.use(notFoundHandler);

  if (!module.parent) {
    server.listen(port);
    if (process.send) {
      process.send('online');
    }
    console.log('Server has started on port ' + port + '.');
  }

  process.on('message', function (message) {
    if (message === 'shutdown') {
      server.close(function () {
        process.exit(0);
      });

      setTimeout(function () {
        process.exit(0);
      }, 10 * 1000);
    }
  });
}

loadModels(startServer);
