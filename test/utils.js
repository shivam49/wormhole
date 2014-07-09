
/* jshint camelcase: false */

var fowl = require('fowl');

fowl.open();

var bcrypt = require('bcrypt');

var app = require('../index');

function password(pass, callback) {
  bcrypt.genSalt(12, function (err, salt){
    bcrypt.hash(pass, salt, callback);
  });
}

// # delete all of our test accounts...
before(function (done) {
  this.timeout(10000);
  fowl.find('user passports', {
    method: 'email',
    token: 'eekohtest@eekoh.me'
  }).then(function (userPassport) {
    if (!userPassport || userPassport.length < 1) {
      return done();
    }

    userPassport.forEach(function (up) {
      fowl.remove(['user passports', up._id]);
    });

    done();
  });
});

before(function (done) {
  this.timeout(10000);
  fowl.find('user passports', {
    method: 'email',
    token: 'eekoh.test@eekoh.me'
  }).then(function (userPassport) {
    if (!userPassport || userPassport.length < 1) {
      return done();
    }

    userPassport.forEach(function (up) {
      fowl.remove(['user passports', up._id]);
    });

    done();
  });
});

before(function (done) {
  this.timeout(10000);
  fowl.find('users', {
    first_name: 'Eekoh',
    last_name: 'Test'
  }).then(function (user) {
    if (!user || user.length < 1) {
      return done();
    }

    user.forEach(function (u) {
      fowl.remove(['users', u._id]);
      fowl.find('user passports', {
        user_id: u._id
      }).then(function (passports) {
        passports.forEach(function (p) {
          fowl.remove(['user passports', p._id]);
        });
      });
    });

    done();
  });
});

before(function (done) {
  this.timeout(10000);
  fowl.find('user passports', {
    method: 'username',
    token: 'eekohtestme'
  }).then(function (userPassports) {
    console.log(userPassports)
    if (!userPassports || userPassports.length < 1) {
      return done();
    }

    var tr = fowl.transaction();

    userPassports.forEach(function (userPassport) {
      tr.remove(['user passports', userPassport._id]);
    });

    tr.commit().then(function() {
      done();
    });
  });
});

// # END: delete all of our test accounts...

before(function (done) {
  this.timeout(10000);

  var self = this;
  this.db = fowl;
  this.app = app;

  this.db.find('user passports', {
    method: 'email',
    token: 'eekoh.test@eekoh.me'
  }).then(function (userPassport) {
    if (userPassport && userPassport.length > 0) {
      self.userPassport = userPassport[0];
      findUser();
    }

    function findUser() {
      self.db.get(['users', self.userPassport.user_id]).then(function (user) {
        self.user = user;
        done();
      });
    }

    password('test', function (err, pass) {
      if (err) {
        return done(err);
      }

      self.db.create('user passports', {
        method: 'email',
        token: 'eekoh.test@eekoh.me',
        secret: pass
      }).then(function (userPassport) {
        self.db.create('users', {
          first_name: 'Eekoh',
          last_name: 'Test'
        }).then(function (user) {
          self.db.get(['users', user]).then(function (user) {
            self.user = user;
            self.db.get(['user passports', userPassport]).then(function (userPassport) {
              self.userPassport = userPassport;
              fowl.put(['user passports', userPassport._id, 'user_id'], user._id);
              done();
            });
          });
        });
      }, done);
    });
  });
});

after(function (done) {
  this.db.remove(['user passports', this.userPassport._id]);
  this.db.remove(['users', this.user._id]);
  done();
});
