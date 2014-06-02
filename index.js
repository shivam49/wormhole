'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    hapi = require('hapi');

var port = process.env.PORT || 8000;
var config = {
  debug: {
    request: [ 'error' ]
  },
  files: {
    relativeTo: __dirname
  }
};

// Create a server with a host and port
var server = new hapi.Server(port, config);

// HAPI Plugin Path
var plugins = path.join(__dirname, 'app', 'plugins');

// Load Development Helper Plugin
server.pack.require(path.join(plugins, 'development'), function(err) {
  if (err) {
    console.error('Failed loading plugin: development');
  }
});

server.views({
  engines: {
    jade: 'jade'
  },
  path: path.join(__dirname, 'app', 'views'),
  compileOptions: {
    basedir: path.join(__dirname, 'modules'),
    pretty: true
  },
  isCached: false
});

// Load Models
function loadModels(callback) {
  callback();
}

// Load Routes
function loadRoutes(callback) {
  var routes = path.join(__dirname, 'app', 'routes');

  fs.readdir(routes, function(err, files) {
    if (err) {
      return callback(err);
    }

    async.each(files, function(file, cb) {
      var route = require(path.join(routes, file));
      server.route(route);
      cb();
    }, callback);
  });
}

async.series([
  loadModels,
  loadRoutes
], function(err) {
  if (err) {
    throw new Error(err);
  }

  server.start(function() {
    if (process.send) {
      process.send('online');
    }
  });
});
