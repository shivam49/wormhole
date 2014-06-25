
/* jshint camelcase: false */

'use strict';

var http = require('http');
http.globalAgent.maxSockets = http.globalAgent.maxSockets + 1000;

var moment            = require('moment');
var _                 = require('lodash');
var util              = require('util');
var path              = require('path');
var express           = require('express');
var bodyParser        = require('body-parser');
var methodOverride    = require('method-override');
var csrf              = require('csurf');
var cookieParser      = require('cookie-parser');
var session           = require('express-session');
var compress          = require('compression');
var helmet            = require('helmet');
var passport          = require('passport');
var flash             = require('connect-flash');
var passport          = require('passport');
var LocalStrategy     = require('passport-local').Strategy;
var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy  = require('passport-facebook').Strategy;
var TwitterStrategy   = require('passport-twitter');
var session           = require('express-session');
var RedisStore        = require('connect-redis')(session);
var config            = require(path.join(__dirname, 'config'));
var models            = require(path.join(__dirname, 'app', 'models'));
var app               = express();


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
  {usernameField: 'email'},
  function (email, password, done) {
    models.UserPassports.loginWithEmail({email: email, password: password}, login);

    function login(err, user) {
      if (!user || !!err || err === false) {
        return done(null, false, {message: 'This email/password combination doesn\'t exist.'});
      }

      done(null, user);
    }
  }
));

passport.serializeUser = function(user, done) {
  done(null, user.id);
};

passport.deserializeUser = function(id, req, done) {
  models.User.find({
    attributes: ['id', 'first_name', 'last_name', 'type', 'auth_user_key'],
    where: {id: parseInt(id, 10)}
  }).complete(function (err, user) {
    done(null, user);
  });
};

app.disable('x-powered-by');
app.enable('trust proxy');

app.use(bodyParser());

app.use(helmet.xframe());
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.use(helmet.cacheControl());

app.use(cookieParser());
app.use(methodOverride());

app.use(session({
  store: new RedisStore(config.express.sessions.redis),
  secret: config.express.sessions.secret
}));

app.use(flash());
app.use(csrf());

app.use(compress());

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
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

  res.locals.basedir = path.join(__dirname, 'modules');

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

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'jade');

// load the controllers
app = require(path.join(__dirname, 'routes'))(app);

app.use(function (err, req, res, next) {
  // set default error status code
  res.statusCode = (_.isNumber(err.status)) ? err.status : 500;

  if (!_.isString(err.message)) {
    err.message = 'An unknown error has occured, please try again';
  }

  // if we pass an error object, then we want to simply return the message...
  // if we pass an object, then we want to do a stack trace, and then return the object + stack
  var error = {};

  // set error type
  error.type = _.isString(err.param) ? 'invalid_request_error' : 'api_error';

  // set error message and stack trace
  if (util.isError(err)) {
    error.message = err.message;
  } else {
    _.extend(error, err);
  }

  error.stack = _.isUndefined(err.stack) ? new Error(err.message).stack : err.stack;

  // set error level
  var level = (res.statusCode < 500) ? 'warning' : 'error';

  // if we have a mongoose validation err
  // then we know to output all the errors
  if (_.isObject(error.errors) && !_.isEmpty(error.errors)) {
    var messages = [];
    _.each(error.errors, function(errMsg) {
      if (_.isString(errMsg.message)) {
        messages.push(errMsg.message);
      }
    });

    if (!_.isEmpty(messages)) {
      error.message = messages.join(' ');
    }
  }

  console.error(error.message);
  console.error(error.stack);

  res.format({
    text: function() {
      res.send(error.message);
    },
    html: function() {
      req.flash(level, error.message);
      res.redirect('back');
    },
    json: function() {
      res.json({ error: error });
    }
  });
});

if (!module.parent) {
  var port = process.env.PORT || 8000;

  app.listen(port);

  if (process.send) {
    process.send('online');
  }

  console.log('Server has started on port ' + port + '.');
}

// for naught
process.on('message', function (message) {
  if (message === 'shutdown') {
    app.close(function () {
      process.exit(0);
    });

    setTimeout(function () {
      process.exit(0);
    }, 10 * 1000);
  }
});

function authCallback(token, tokenSecret, profile, done) {
  process.nextTick(function() {
    models.UserPassports.find({
      where: {
        token: profile.id,
        method: profile.provider
      },
      include: [models.User]
    }).complete(function (err, userPassport) {
      if (err) {
        return done(err);
      }

      if (userPassport) {
        updateUser();
        // return done(null, userPassport.User);
      } else {
        createUser();
      }

      function finish(err, user) {
        if (err) {
          return done(err);
        }

        done(null, user);
      }

      function updateUser() {
        userPassport.secret = tokenSecret || token;
        userPassport.save(['secret']).complete(function (err) {
          finish(err, userPassport.user);
        });
      }

      function createUser() {
        var fname   = profile.name.givenName;
        var lname   = profile.name.familyName;
        var emails  = (profile.emails || [{value: ''}]).map(function (e) { return e.value; });

        models.User.create({
          first_name: fname,
          last_name: lname
        }).complete(function (err, user) {
          if (err) {
            return done(err);
          }

          models.UserPassports.create({
            user_id: user.id,
            method: profile.provider,
            token: profile.id,
            secret: tokenSecret || token,
            email: Array.isArray(emails) && emails.length > 0 && !_.isEmpty(emails[0].trim()) ? emails[0] : ''
          }).complete(function (err) {
            finish(err, user);
          });
        });
      }
    });
  });

}

