'use strict';

var _       = require('lodash');
var express = require('express');
var path    = require('path');
var server  = require(path.join(__dirname, 'server'));
var models  = require(path.join(__dirname, 'app', 'models'));
var app     = express();

// initialize the controllers
app = require(path.join(__dirname, 'app', 'routes'))(app);

function loadModels(fn) {
  // we'll want to get rid of force true eventually...
  models.sequelize.sync({force: true}).complete(fn);
}

function errorHandler(err, req, res, next) {
  if (err.message && err.message.indexOf('not found') > 0) {
    return next();
  }

  console.error(err.stack);

  if (err.message) {
    req.flash('error', err.message);
    return res.redirect('back');
  }

  var errors = [];
  Object.keys(err).forEach(function (key) {
    errors = errors.concat(_.flatten(err[key]));
  });

  req.flash('error', _.flatten(errors).join('<br>'));
  res.redirect('back');
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
