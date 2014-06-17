
/* jshint camelcase: false */

var async       = require('async');
var request     = require('request');
var path        = require('path');
var riak        = require(path.join(__dirname, '..', 'riak'));
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();
// var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
// var ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;
var models = require(path.join(__dirname, '..', 'models'));

var main = controller.route('/');

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

function getArticles(req, res, next) {
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

  if (req.url === '/news') {
    elastic.search({
      index: 'articles12',
      size: 200,
      body: {
        query: {
          match: {
            article_text: [
              'apple',
              'amazon',
              'snapchat',
              'gasoline',
              'oz',
              'ukraine',
              'iraq',
              'tony gwynn',
              'general motors',
              'games of thrones',
              'kardashian',
              'fifa',
              'obama',
              'berry',
              'kings',
              'spurs',
            ].join(' '),
          }
        }
      },
      minimum_should_match: 1,
      boost: 10
    }).then(response, next);
  } else if (req.url !== '/') {
    var topic = req.url.substr(1);
    elastic.search({
      index: 'articles12',
      body: {
        query: {
          match: {
            article_category: topic
          }
        }
      },
      size: 200
    }).then(response, next);
  } else {
    elastic.search({
      index: 'articles12',
      size: 200
    }).then(response, next);
  }
}

main.get(getArticles)
.post(function (req, res) {
  // Alex.. change this..
  var articleHash = req.body.articleHash || '';

  var data = {
    action: 'article_add',
    articleHash: articleHash
  };

  if (req.user) {
    data.id_user = req.user.id_user;
  }

  models.Record.create(data).complete(function (/* err */) {
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

controller.route('/news').get(getArticles);
controller.route('/entertainment').get(getArticles);
controller.route('/politics').get(getArticles);
controller.route('/sports').get(getArticles);
controller.route('/edutech').get(getArticles);
controller.route('/business').get(getArticles);
controller.route('/lifestyle').get(getArticles);

controller.route('/article/:article')
.get(function (req, res, next) {
  function getRelated(article) {
    elastic.mlt({
      index: 'articles12',
      type: 'article',
      id: article._id
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      response(article, results);
    });
  }

  function response(article, related) {
    models.Record.create({
      action: 'article_viewed',
      articleHash: req.params.article
    }).complete(function () {
      /* error logging concept goes here */
    });

    async.map(related.hits.hits, getImageClass, function (err, results) {
      if (err) {
        return next(err);
      }

    res.render('article', {
      article: article,
        related: results
      });
    });
  }

  elastic.get({
    index: 'articles12',
    type: 'article',
    id: req.params.article
  }).then(getRelated, next);
});

module.exports = ['/', controller];
