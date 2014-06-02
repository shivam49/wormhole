var fs    = require('fs'),
    path  = require('path'),
    async = require('async'),
    hapi  = require('hapi');

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

// Load HAPI Plugins
require('./app/plugins')(server);

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
      if (path.extname(file) === '.js') {
        var route = require(path.join(routes, file));
        server.route(route);
      }
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
