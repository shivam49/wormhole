var path        = require('path');
var riak        = require(path.join(__dirname, '..', 'riak'));
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
// var ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;
var models = require(path.join(__dirname, '..', 'models'));

var main = controller.route('/');

main.get(ensureLoggedIn('/login'))
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
  function response(err, article) {
    if (err) {
      return next(err);
    }

    models.Record.create({
      action: 'article_viewed',
      articleHash: JSON.stringify(article)
    }).complete(function () {
      /* error logging concept goes here */
    });

    res.render('article', {
      article: article
    });
  }

  console.log(req.params.article);
  riak.get('clean_text6', req.params.article, response);
});

module.exports = ['/', controller];
