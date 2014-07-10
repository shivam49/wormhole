var path   = require('path');
var config = require(path.join(__dirname, '..', '..', 'config'));
var jwt    = require('jsonwebtoken');

exports.user = function (req, res) {
  res.json(req.user._id);
};

exports.users = function (req, res) {
  req.db.find('users', function () {
    return true;
  }).then(function (users) {
    res.json(users);
  });
};

exports.eekoh = function (req, res) {
  req.db.find([ 'user', req.user._id, 'eekoh' ], function () { 
    return true;
  }).then(function (articles) {
    res.json(articles);
  });
};

exports.jwt = function getJWT(req, res) {
  var payload = {
    userID: req.user._id,
    sessionID: req.sessionID
  };

  res.send(jwt.sign(payload, config.express.sessions.secret));
};
