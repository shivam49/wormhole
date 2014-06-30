
/* jshint camelcase: false */

'use strict';

var http = require('http');
http.globalAgent.maxSockets = http.globalAgent.maxSockets + 1000;

var path     = require('path');
var express  = require('express');
var app      = express();

app = require(path.join(__dirname, 'lib', 'configure'))(app);

// load the controllers
app = require(path.join(__dirname, 'routes'))(app);

app.use(require(path.join(__dirname, 'lib', 'error-handler')));

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

