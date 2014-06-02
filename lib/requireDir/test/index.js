/* global describe, it */
var assert     = require('assert'),
    requireDir = require('../index.js');

describe('requireDir', function () {
  it('it should require all files and directories in a folder', function () {
    var requires = requireDir('test/example');
    assert.deepEqual(requires, {
      'example'    : 'example/index.js',
      'example.js' : 'example.js',
      'index.js'   : 'index.js'
    });
  });
});
