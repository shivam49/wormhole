'use strict';

var fs   = require('fs');
var path = require('path');

function isJsFile(file) {
  return path.extname(file).toLowerCase() === '.js';
}
exports.isJsFile = isJsFile;

function isNotUtilFile(file) {
  var files = ['index.js', 'utils.js'];
  return files.indexOf(path.basename(file).toLowerCase()) === -1;
}
exports.isNotUtilFile = isNotUtilFile;

function bootstrap(dir) {
  var files = fs
    .readdirSync(dir)
    .filter(isJsFile)
    .filter(isNotUtilFile);

  return files;
}
exports.bootstrap = bootstrap;
