var express = require('express');
var path    = require('path');
var server  = require(path.join(__dirname, 'server'));
var models  = require(path.join(__dirname, 'app', 'models'));
var app     = express();

// initialize the controllers
app = require(path.join(__dirname, 'app', 'routes'))(app);

function loadModels(fn) {
  models.sequelize.sync({force: true}).complete(fn);
}

function errorHandler(err, req, res, next) {
  if (err.message.indexOf('not found') > -1) {
    return next();
  }

  console.error(err.stack);

  res.status(500).send('An error has occurred.');
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
    console.log('Server has started on port ' + port + '.');
  }
}

loadModels(startServer);
