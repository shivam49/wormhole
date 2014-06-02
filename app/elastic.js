var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: '192.168.3.53:9200',
  log: 'trace',
});

module.exports = client;
