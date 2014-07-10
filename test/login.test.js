
var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;

require('./utils');

describe('Login', function() {
  describe('with email', function() {
    it('should return an error with invalid fields...', function (done) {
      request(this.app)
      .post('/login')
      .send({})
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/login');
        done();
      });
    });

    it('should return an error with invalid user...', function (done) {
      request(this.app)
      .post('/login')
      .send({
        username: 'invalidemail@.doesntexist.com',
        password: '123'
      })
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/login');
        done();
      });
    });

    it('should return an error with invalid password', function (done) {
      request(this.app)
      .post('/login')
      .send({
        username: 'eekoh.test@eekoh.me',
        password: 'test123'
      })
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/login');
        done();
      });
    });

    it('should return to the main page upon successful login...', function (done) {
      request(this.app)
      .post('/login')
      .send({
        username: 'eekoh.test@eekoh.me',
        password: 'test'
      })
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/');
        done();
      });
    });
  });

  describe('with username', function() {
    it('should return an error with invalid user...', function (done) {
      request(this.app)
      .post('/login')
      .send({
        username: 'invaliduser',
        password: '123'
      })
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/login');
        done();
      });
    });

    it('should return an error with invalid password', function (done) {
      request(this.app)
      .post('/login')
      .send({
        username: 'eekohtestme',
        password: 'test123'
      })
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/login');
        done();
      });
    });

    it('should return to the main page upon successful login...', function (done) {
      request(this.app)
      .post('/login')
      .send({
        username: 'eekohtestme',
        password: 'password'
      })
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.header.location).to.equal('/');
        done();
      });
    });
  });
});
