var express = require('express');
var controller = express.Router();

controller.route('/logout')
.get(logOut);

function logOut(req, res) {
  req.logout();
  res.redirect('/');
}

module.exports = ['/', controller];
