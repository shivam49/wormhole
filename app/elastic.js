var path = require('path');
var config = require(path.join(__dirname, '..', 'config'));
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: '192.168.3.53:9200',
  log: config.elastic.log
});

module.exports = client;
