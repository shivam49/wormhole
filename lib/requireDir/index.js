'use strict';

var fs   = require('fs'),
    path = require('path');

function requireDir(dir) {
  var requires = {};

  fs.readdirSync(dir).forEach(function (filename) {
    var ext      = path.extname(filename),
        fullPath = path.resolve(path.join(dir, filename));

    if (fs.statSync(fullPath).isDirectory()) {
      var indexFile = path.join(fullPath, 'index.js'),
          partialPath = path.relative(fullPath, indexFile);
      console.log(partialPath);
      if (fs.existsSync(indexFile)) {
        requires[filename] = require(indexFile);
      }
    } else {
      if (ext === '.js') {
        requires[filename] = require(fullPath);
      }
    }
  });

  return requires;
}

module.exports = requireDir;
