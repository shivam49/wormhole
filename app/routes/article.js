var async       = require('async');
var http        = require('http');
var request     = require('request');
var path        = require('path');
var riak        = require(path.join(__dirname, '..', 'riak'));
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();
// var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
// var ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;
var models = require(path.join(__dirname, '..', 'models'));

http.globalAgent.maxSockets = http.globalAgent.maxSockets + 100;

var main = controller.route('/');

main //.get(ensureLoggedIn('/login'))
.get(function (req, res, next) {
  function getImageClass(i, done) {
    if (/\/\d+$/.test(i._source.image)) {
      var image = i._source.image.match(/\/\d+$/)[0];
      request('http://riak.internal.eekoh.me/masonry' + image + '.json', function (err, resp, body) {
        if (! err && resp.statusCode == 200) {
          var data = JSON.parse(body);
          if (data.noImage) {
            i.noImage = true;
            i.imageClass = 'one_one';
          } else {
            i.imageClass = data.imageClass;
            i._source.image = 'http://riak.internal.eekoh.me/masonry' + image
          }
          return done(null, i);
        } else {
          i.noImage = true;
          i.imageClass = 'one_one';
          return done(null, i);
        }
      });
    } else {
      i._source.image = 'http://vps.eekoh.me/cache.php?url=' + encodeURIComponent(i._source.image)
      i.noImage = true;
      i.imageClass = 'one_one';
      return done(null, i);
    }
    // var url = 'http://riak.internal.eekoh.me/masonry'
  }

  function response(articles) {
    async.map(articles.hits.hits, getImageClass, function (err, results) {
      if (err) {
        return next(err);
      }

      res.render('articles', {
        articles: results
      });
    });
  }

  elastic.search({
    index: 'articles12',
    size: 49
  }).then(response, next);
})
.post(function (req, res) {
  // Alex.. change this..
  var articleHash = req.body.articleHash || '';

  models.Record.create({
    action: 'article_add',
    articleHash: articleHash
  }).complete(function (/* err */) {
    // if (err) {
      // eventually we'll want some sort of lib logger (bunyan?)
    // }
  });

  res.format({
    html: function() {
      req.flash('success', 'Your article has been submitted.');
      res.redirect('back');
    },
    json: function() {
      // Alex: place the newely generated article / JSON output here...
      res.json(true);
    }
  });
});

controller.route('/article/:article')
.get(function (req, res, next) {
  function response(article) {
    models.Record.create({
      action: 'article_viewed',
      articleHash: req.params.article
    }).complete(function () {
      /* error logging concept goes here */
    });

    res.render('article', {
      article: article
    });
  }

  elastic.get({
    index: 'articles12',
    type: 'article',
    id: req.params.article
  }).then(response, next);
});

module.exports = ['/', controller];
