var path        = require('path');
var riak        = require(path.join(__dirname, '..', 'riak'));
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();

controller.route('/lumberyard')
.get(function (req, res, next) {
  console.log('it works');
  res.render('lumberyard');
 });


 module.exports = ['/', controller];
 console.log('this is the end');
