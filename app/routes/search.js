var _           = require('lodash');
var path        = require('path');
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();
var async       = require('async');
var request     = require('request');

controller.route('/:words')
.get(function (req, res, next) {
  if (_.isUndefined(req.params.words) || !_.isString(req.params.words)) {
    return res.redirect('/');
  }

  elastic.search({
    index: 'articles12',
    type: 'article',
    size: 49,
    body: {
      query: {
        match: {
          article_text: req.params.words
        }
      }
    }
  }).then(response, next);

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
});

module.exports = ['/search', controller];
