
/* jshint camelcase: false */

var bcrypt            = require('bcrypt');
var _                 = require('lodash');
var path              = require('path');
var flash             = require('connect-flash');
var config            = require(path.join(__dirname, '..', 'config'));
var moment            = require('moment');
var bodyParser        = require('body-parser');
var methodOverride    = require('method-override');
var csrf              = require('csurf');
var cookieParser      = require('cookie-parser');
var session           = require('express-session');
var compress          = require('compression');
var helmet            = require('helmet');
var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy  = require('passport-facebook').Strategy;
var TwitterStrategy   = require('passport-twitter');
var session           = require('express-session');
var RedisStore        = require('connect-redis')(session);
var fowl              = require('fowl');
var express           = require('express');

// open the database
fowl.open();

passport.use(new GoogleStrategy({
  callbackURL: config.google.callbackUrl,
  clientID: config.google.id,
  clientSecret: config.google.secret
}, authCallback));

passport.use(new FacebookStrategy({
  callbackURL: config.facebook.callbackUrl,
  clientID: config.facebook.id,
  clientSecret: config.facebook.secret
}, authCallback));

passport.use(new TwitterStrategy({
  callbackURL: config.twitter.callbackUrl,
  consumerKey: config.twitter.id,
  consumerSecret: config.twitter.secret
}, authCallback));

passport.use(new LocalStrategy(
  {usernameField: 'username'},
  function (email, password, done) {
    process.nextTick(function() {
      // so.. email validation rules are pretty much like the wild-wild-west with the exception of
      // having a dot (.) next to the at-sign (@)
      var isEmail = email.indexOf('@') > -1 && email.indexOf('.') > -1 && email.indexOf('@.') === -1;

      if (isEmail) {
        findByEmail();
      } else {
        findByUser();
      }

      function findByUser() {
        fowl.find('user passports', {
          method: 'username',
          token: email.toLowerCase()
        }).then(checkUserPassport);
      }

      function findByEmail() {
        fowl.find('user passports', {
          method: 'email',
          token: email.toLowerCase()
        }).then(checkUserPassport);
      }

      function checkUserPassport(userPassport) {
        if (!password || !userPassport || !userPassport[0] || !_.isString(userPassport[0].secret) || _.isEmpty(userPassport[0].secret.trim())) {
          return done(null, false, {message: 'This email/password combination doesn\'t exist.'});
        }

        bcrypt.compare(password, userPassport[0].secret, function (err, res) {
          if (err) {
            return done(err);
          }

          if (!res) {
            return done(null, false, {message: 'This email/password combination doesn\'t exist.'});
          }

          var tr1 = fowl.transaction();
          var user;
          tr1.get(['users', userPassport[0].user_id]).then(function (_user) {
            user = _user;
          }, done);

          return tr1.commit().then(function() {
            done(null, user);
          }, done);
        });
      }
    });

    // function password(password, callback) {
    //   bcrypt.genSalt(12, function (err, salt){
    //     bcrypt.hash(password, salt, callback);
    //   });
    // }
  }
));

passport.serializeUser = function(user, done) {
  done(null, user._id);
};

passport.deserializeUser = function(id, req, done) {
  return fowl.get(['users', id]).then(function (user) {
    return done(null, user);
  });
};

module.exports = function(app) {
  app.disable('x-powered-by');
  app.enable('trust proxy');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());

  app.use(cookieParser());
  app.use(methodOverride());

  app.use(session({
    saveUninitialized: true,
    resave: true,
    store: new RedisStore(config.express.sessions.redis),
    secret: config.express.sessions.secret
  }));

  app.use(flash());

  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'local' && process.env.NODE_ENV) {
      app.use(csrf());
  }

  app.use(function (req, res, next) {
    if (! req.csrfToken) {
      res.locals.csrf = '';
      req.csrfToken = res.locals.csrfToken = function() {
        return '';
      };
    }
    next();
  });

  // app.use(compress());

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function (req, res, next) {
    req.db = fowl;

    res.locals.authenticated = req.isAuthenticated();
    res.locals.user = req.user || {};

    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      info: req.flash('info'),
      warning: req.flash('warning')
    };

    res.locals.req = req;
    res.locals.csrf = req.csrfToken();
    res.locals.moment = moment;
    res.locals._ = _;

    res.locals.basedir = path.join(__dirname, '..', 'modules');

    res.locals.svg = function(path, alt, fileType) {
      if (! path) {
        throw new Error('Missing path for svg');
      }

      var fileExt = 'png';
      if (fileType) {
        fileExt = fileType;
      }

      var fallback = path.replace('.svg', '.' + fileExt);
      return '<img class="svg" src="' + path + '" onerror="this.removeAttribute(\'onerror\'); this.src=\'' + fallback + '\'" />';
    };

    next();
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.set('views', path.join(__dirname, '..', 'app', 'views'));
  app.set('view engine', 'jade');

  return app;
};

function authCallback(token, tokenSecret, profile, done) {
  process.nextTick(function() {
    findUserPassports().then(findOrCreate);

    function login(userId) {
      fowl.get(['users', userId]).then(function (user) {
        done(null, user);
      }, done);
    }

    function findUserPassports() {
      return fowl.find('user passports', {
        method: profile.provider,
        token: profile.id
      });
    }

    function findOrCreate(userPassports) {
      if (!userPassports || !userPassports.length) {
        return createUser();
      }

      return updateUser(null, userPassports[0]);
    }

    function createUser() {
      var fname   = profile.name.givenName;
      var lname   = profile.name.familyName;
      var emails  = (profile.emails || [{value: ''}]).map(function (e) { return e.value; });
      var id;

      fowl.create('users', {
        first_name: fname,
        last_name: lname
      })
      .then(function (userId) {
        id = userId;

        return fowl.create('user passports', {
          user_id: userId,
          method: profile.provider,
          token: profile.id,
          secret: tokenSecret || token,
          email: Array.isArray(emails) && emails.length > 0 && !_.isEmpty(emails[0].trim()) ? emails[0] : ''
        });
      })
      .then(function() {
        login(id);
      }, done);
    }

    function updateUser(err, userPassport) {
      fowl.put(['user passports', userPassport._id, 'secret'], tokenSecret || token)
      .then(function() {
        login(userPassport.user_id);
      }, done);
    }
  });

}
