var path        = require('path');
var riak        = require(path.join(__dirname, '..', 'riak'));
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();

controller.route('/inbox')
.get(function (req, res, next) {
  res.render('inbox');
 });


module.exports = ['/', controller];
