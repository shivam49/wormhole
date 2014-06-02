var riak = require('../riak'),
    elastic = require('../elastic');

// Add the route
var list = {
  handler: function (request, reply) {
    elastic.search({
      index: 'articles6',
      size: 49
    }).then(function (articles) {
      reply.view('articles', {
        articles: articles.hits.hits
      });
    });
  }
};

var article = {
  handler: function (request, reply) {
    riak.buckets(function (err, buckets) {
      if (err) {
        return reply('error');
      }

      reply.view('articles', {
        buckets: JSON.stringify(buckets)
      });
    });
  }
};

module.exports = [
  { method: 'GET', path: '/', config: list },
  { method: 'GET', path: '/articles/{article}', config: article }
];
