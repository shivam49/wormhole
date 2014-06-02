var request = require('request');

var host = 'http://192.168.3.52:8098';

function buckets(callback) {
  var url = host + '/buckets/?buckets=true';
  return request(url, function (error, response, body) {
    callback(error, JSON.parse(body), response);
  });
}

function keys(bucket, callback) {
  var url = host + '/buckets/' + bucket + '/keys/?keys=true';
  return request(url, function (error, response, body) {
    callback(error, JSON.parse(body), response);
  });
}

function get(bucket, key, callback) {
  var url = host + '/buckets/' + bucket + '/keys/' + key;
  return request(url, function (error, response, body) {
    callback(error, body, response);
  });
}

module.exports = {
  buckets: buckets,
  keys: keys,
  get: get
};
