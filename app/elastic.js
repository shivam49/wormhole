var path = require('path');
var config = require(path.join(__dirname, '..', 'config'));
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: '192.99.15.211:9200',
  log: config.elastic.log
});

module.exports = client;
