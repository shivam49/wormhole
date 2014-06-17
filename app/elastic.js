var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: '192.99.15.211:9200',
  log: 'trace'
});

module.exports = client;
