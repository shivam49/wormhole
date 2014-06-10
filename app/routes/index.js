var path  = require('path');
var utils = require(path.join('..', '..', 'utils'));

// todo: throw this into a common plugin folder or something...
// make it compatible with jade locals
function svg(path, alt, fileType) {
  if (! path) {
    throw new Error('Missing path for svg');
  }

  var fileExt = 'png';
  if (fileType) {
    fileExt = fileType;
  }

  var fallback = path.replace('.svg', '.' + fileExt);
  return '<img class="svg" src="' + path + '" onerror="this.removeAttribute(\'onerror\'); this.src=\'' + fallback + '\'" />';
}

/**
 * Bootstraps all of the files in /controllers then attaches
 * the controller to the application.
 *
 * @param  {Object} app Express object
 * @return {Object}     Returns modified app
 * @api public
 */

function loadControllers(app) {
  app.set('views', path.join(__dirname, '..', 'views'));
  app.locals.basedir = path.join(__dirname, '..', '..', 'modules');
  app.locals.svg = svg;

  function load(file) {
    var ctrl      = require(path.join(__dirname, file));
    var isObject  = typeof ctrl === 'object' && ctrl !== null;

    if (Array.isArray(ctrl)) {
      app.use(ctrl[0], ctrl[1]);
    }
    else if (isObject) {
      app.use(ctrl.path, ctrl.controller);
    }
    else {
      app.use('/', ctrl);
    }
  }

  utils.bootstrap(__dirname).forEach(load);

  return app;
}

module.exports = loadControllers;
