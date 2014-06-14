var path        = require('path');
var riak        = require(path.join(__dirname, '..', 'riak'));
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();

controller.route('/')
.get(function (req, res, next) {
  function response(articles) {
    res.render('articles', {
      articles: articles.hits.hits
    });
  }

  elastic.search({
    index: 'articles6',
    size: 49
  }).then(response, next);
});

controller.route('/article/:article')
.get(function (req, res, next) {
  function response(err, article) {
    if (err) {
      return next(err);
    }

    res.render('article', {
      article: article.buckets
    });
  }

  riak.buckets(response);
});

module.exports = ['/', controller];
