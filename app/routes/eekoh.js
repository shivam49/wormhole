var async       = require('async');
var path        = require('path');
var express     = require('express');
var controller  = express.Router();

var models = require(path.join(__dirname, '..', 'models'));

controller.route('/')
.get(function (req, res, next) {
  async.parallel({
    eekohs: function (fn) {
      // get a list of the user's eekohs...
      fn(null, ['Politics', 'Sports']);
    },
    visited: function (fn) {
      // get a list of eekoh's that we've visited...
      fn(null, ['Sports', 'Lebron James', 'Obama', 'Politics', 'Rick Perry', 'Florida']);
    }
  }, response);

  function response(err, results) {
    if (err) {
      return next(err);
    }

    res.format({
      html: function() {
        res.render('eekoh', results);
      },
      json: function() {
        res.json(results);
      }
    });
  }
})
.post(function (req, res) {
  // Alex.. change this..
  var eekohHash = req.body.eekohHash || '';

  models.Record.create({
    action: 'eekoh_add',
    articleHash: eekohHash
  }).complete(function (/* err */) {
    // if (err) {
      // eventually we'll want some sort of lib logger (bunyan?)
    // }
  });

  res.format({
    html: function() {
      req.flash('success', 'Your eekoh system has been submitted.');
      res.redirect('back');
    },
    json: function() {
      // Alex: place the newely generated article / JSON output here...
      res.json(true);
    }
  });
});

module.exports = ['/eekoh', controller];
