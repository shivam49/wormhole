
/* jshint camelcase: false */

var _           = require('lodash');
var path        = require('path');
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var async       = require('async');
var request     = require('request');

exports.index = function(req, res, next) {
  var noParams = _.isUndefined(req.params.words) || !_.isString(req.params.words);
  var noBody = _.isUndefined(req.body.words) || !_.isString(req.body.words);

  if (noParams && noBody) {
    return res.redirect('/');
  }

  var search = req.params.words || req.body.words;

  if (!! ~search.indexOf('@')) {
    request('http://mobileapp.eekoh.me/fb.php?email=' + search, function (err, response, body) {
      elastic.search({
        index: 'articles12',
        type: 'article',
        size: 200,
        body: {
          query: {
            match: {
              article_text: body.toString()
            }
          }
        }
      }).then(response, next);
    });
  } else {
    elastic.search({
      index: 'articles12',
      type: 'article',
      size: 200,
      body: {
        query: {
          match: {
            article_text: search
          }
        }
      }
    }).then(response, next);
  }

  function getImageClass(i, done) {
    if (/\/\d+$/.test(i._source.image)) {
      var image = i._source.image.match(/\/\d+$/)[0];
      request('http://riak.internal.eekoh.me/masonry' + image + '.json', function (err, resp, body) {
        if (! err && resp.statusCode === 200) {
          var data = JSON.parse(body);
          if (data.noImage) {
            i.noImage = true;
            i.imageClass = 'one_one';
          } else {
            i.imageClass = data.imageClass;
            i._source.image = 'http://riak.internal.eekoh.me/masonry' + image;
          }
          return done(null, i);
        } else {
          i.noImage = true;
          i.imageClass = 'one_one';
          return done(null, i);
        }
      });
    } else {
      i._source.image = 'http://vps.eekoh.me/cache.php?url=' + encodeURIComponent(i._source.image);
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
};
