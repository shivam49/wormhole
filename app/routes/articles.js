
/* jshint camelcase: false */

var _           = require('lodash');
var async       = require('async');
var request     = require('request');
var path        = require('path');
var elastic     = require(path.join(__dirname, '..', 'elastic'));

exports.index = function(req, res, next) {
  function imageClasses(articles) {
    async.map(articles.hits.hits, getImageClass, response);
  }

  function response(err, results) {
    if (err) {
      return next(err);
    }

    res.render('articles', {
      articles: results
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
    }).then(imageClasses, next);
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
    }).then(imageClasses, next);
  } else {
    elastic.search({
      index: 'articles12',
      size: 200
    }).then(imageClasses, next);
  }
};

exports.create = function(req, res) {
  // Alex.. change this..
  var articleHash = _.isString(req.body.articleHash) ? req.body.articleHash : '';

  // insert into whichever database / method we're storing the articles then call...
  record();

  function record() {
    if (req.isAuthenticated()) {
      return response();
    }

    var tr = req.db.transaction();

    tr.find('articles created', {
      article: articleHash,
      user: req.user._id
    }).then(function (_article) {
      if (_article) {
        var count = parseInt(_article.count, 10);
        if (isNaN(count)) {
          count = 0;
        }

        return tr.put(['articles created', _article._id, 'count'], (count+1));
      } else {
        return tr.create('articles created', {
          article: articleHash,
          user: req.user._id,
          count: 1
        });
      }
    });

    tr.commit().then(response);
  }

  function response() {
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
  }
};

exports.retrieve = function (req, res, next) {
  function getRelated(article) {
    elastic.mlt({
      index: 'articles12',
      type: 'article',
      id: article._id
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      record(article, results);
    });
  }

  function record(article, related) {
    if (req.isAuthenticated()) {
      return response(article, related);
    }

    var tr = req.db.transaction();

    tr.find('articles viewed', {
      article: req.params.article,
      user: req.user._id
    }).then(function (_article) {
      if (_article) {
        var count = parseInt(_article.count, 10);
        if (isNaN(count)) {
          count = 0;
        }

        return tr.put(['articles viewed', _article._id, 'count'], (count+1));
      } else {
        return tr.create('articles viewed', {
          article: req.params.article,
          user: req.user._id,
          count: 1
        });
      }
    });

    tr.commit().then(function() {
      response(article, related);
    });
  }

  function response(article, related) {
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
};

// # private #

function getImageClass(i, done) {
  if (!(/\/\d+$/.test(i._source.image))) {
    i._source.image = 'http://vps.eekoh.me/cache.php?url=' + encodeURIComponent(i._source.image);
    i.noImage = true;
    i.imageClass = 'one_one';
    return done(null, i);
  }

  var image = i._source.image.match(/\/\d+$/)[0];
  request('http://riak.internal.eekoh.me/masonry' + image + '.json', function (err, resp, body) {
    if (!err && resp.statusCode === 200) {
      var data = JSON.parse(body);
      if (data.noImage) {
        i.noImage = true;
        i.imageClass = 'two_two';
      } else {
        i.imageClass = data.imageClass;
        i._source.image = 'http://riak.internal.eekoh.me/masonry' + image;
      }
    } else {
      i.noImage = true;
      i.imageClass = 'two_two';
    }

    done(null, i);
  });

  // var url = 'http://riak.internal.eekoh.me/masonry'
}
