
/* jshint camelcase: false */

require('./utils');

var chai = require('chai');
var request = require('supertest');
var expect = chai.expect;

beforeEach(function (done) {
  this.formValues = {
    first_name: 'Eekoh',
    last_name: 'Test2',
    email: 'eekohtest@eekoh.me',
    password: 'password',
    password_confirm: 'password',
    gender: 'Male',
    dob: '09/20/1980',
    education: 'High School',
    work: 'Eekoh Inc.',
    position: 'Boss'
  };

  done();
});

describe('Registration', function() {
  this.timeout(10000);

  it('should return an error message when we don\'t fill out our email', function (done) {
    delete this.formValues.email;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in a email.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our first name', function (done) {
    delete this.formValues.first_name;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in a first name.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our last name', function (done) {
    delete this.formValues.last_name;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in a last name.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our password', function (done) {
    delete this.formValues.password;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in a password.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our password confirmation', function (done) {
    delete this.formValues.password_confirm;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must confirm your password correctly.');
      done();
    });
  });

  it('should return an error message when we enter in a password that wasn\'t confirmed correctly.', function (done) {
    this.formValues.password = '123';
    this.formValues.password_confirm = '1234';

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must confirm your password correctly.');
      done();
    });
  });

  it('should return an error message when we enter in a password that\'s fewer than six characters', function (done) {
    this.formValues.password = '123';
    this.formValues.password_confirm = '123';

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('Your password must be at least six (6) characters long.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our email correctly', function (done) {
    this.formValues.email = 'invalidemail.com';

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in a valid email address.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our gender incorrectly', function (done) {
    this.formValues.gender = 'Unknown???';

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('Invalid entry for gender.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our DOB incorrectly', function (done) {
    this.formValues.dob = 'NeverWinter 12th 2010';

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('Your date of birth is invalid.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our education correctly', function (done) {
    delete this.formValues.education;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in an education.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our work correctly', function (done) {
    delete this.formValues.work;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in your work/occupation.');
      done();
    });
  });

  it('should return an error message when we don\'t fill out our position correctly', function (done) {
    delete this.formValues.position;

    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('You must enter in a work/occupation position.');
      done();
    });
  });

  it('should allow us to make a new user without a username', function (done) {
    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(302)
    .end(function (err, res) {
      expect(err).to.be.null;
      done();
    });
  });

  it('should return an error for creating a user with an email address that already exists', function (done) {
    request(this.app)
    .post('/registration')
    .send(this.formValues)
    .set('Accept', 'application/json')
    .expect(500)
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.instanceOf(Object);
      expect(res.body).to.contain.keys('error');
      expect(res.body.error).to.contain.keys('type', 'message');
      expect(res.body.error.type).to.equal('api_error');
      expect(res.body.error.message).to.equal('This e-mail address already exists.');
      done();
    });
  });

  describe('registration with usernames', function () {
    this.timeout(10000);

    // let's delete our test account first so that we can
    // use the same email addresss...
    before(function (done) {
      var self = this;
      this.db.find('user passports', {
        method: 'email',
        token: 'eekohtest@eekoh.me'
      }).then(function (userPassport) {
        if (!userPassport || userPassport.length < 1) {
          return done();
        }

        userPassport.forEach(function (up) {
          self.db.remove(['user passports', up._id]);
        });

        done();
      });
    });

    it('should work with registering a username...', function (done) {
      var self = this;
      this.formValues.username = 'eekohtestme';

      request(this.app)
      .post('/registration')
      .send(this.formValues)
      .set('Accept', 'application/json')
      .expect(302)
      .end(function (err, res) {
        expect(err).to.be.null;

        // now let's find it in our db..
        self.db.find('user passports', {
          method: 'username',
          token: 'eekohtestme'
        }).then(function (userPassports) {
          expect(userPassports).to.be.instanceOf(Array);
          expect(userPassports.length).to.be.above(0);
          done();
        }, done);
      });
    });

    it('should fail to work when registering with a username that already exists...', function (done) {
      this.formValues.username = 'eekohtestme';

      request(this.app)
      .post('/registration')
      .send(this.formValues)
      .set('Accept', 'application/json')
      .expect(500)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body).to.be.instanceOf(Object);
        expect(res.body).to.contain.keys('error');
        expect(res.body.error).to.contain.keys('type', 'message');
        expect(res.body.error.type).to.equal('api_error');
        expect(res.body.error.message).to.equal('This username already exists.');
        done();
      });
    });
  });
});
