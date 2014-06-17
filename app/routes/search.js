var _           = require('lodash');
var path        = require('path');
var elastic     = require(path.join(__dirname, '..', 'elastic'));
var express     = require('express');
var controller  = express.Router();

controller.route('/:words')
.get(function (req, res, next) {
  if (_.isUndefined(req.params.words) || !_.isString(req.params.words)) {
    return res.redirect('/');
  }

  elastic.search({
    index: 'articles12',
    type: 'article',
    body: {
      query: {
        match: {
          body: req.params.words
        }
      }
    }
  }).then(response, next);

  function response(article) {
    res.render('article', {
      article: article
    });
  }
});

module.exports = ['/search', controller];
