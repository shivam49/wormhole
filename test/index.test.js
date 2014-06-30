
require('./utils');

var request = require('supertest');

describe('General', function() {
  it('should work for the index page', function (done) {
    request(this.app).get('/').end(done);
  });
});
