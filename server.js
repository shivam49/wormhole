var moment          = require('moment');
var _               = require('lodash');
var path            = require('path');
var express         = require('express');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var csrf            = require('csurf');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var compress        = require('compression');
var helmet          = require('helmet');
var app             = express();
var passport        = require('passport');
var flash           = require('connect-flash');
var config          = require(path.join(__dirname, 'config'));

app.disable('x-powered-by');
app.enable('trust proxy');
app.use(bodyParser());
app.use(helmet.xframe());
app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());
app.use(helmet.cacheControl());
app.use(cookieParser());
app.use(methodOverride());
app.use(session(config.express.sessions));
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

  res.locals.csrf = req.csrfToken();
  res.locals.moment = moment;
  res.locals._ = _;

  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app', 'views'));
app.set('view engine', 'jade');

module.exports = app;
