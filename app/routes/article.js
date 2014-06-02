'use strict';

// Add the route
var list = {
  handler: function (request, reply) {
    reply.view('articles');
  }
};

var details = {
  handler: function (request, reply) {
    reply('yay');
  }
};

module.exports = [
  { method: 'GET', path: '/', config: list },
  { method: 'GET', path: '/article/{article}', config: details }
];
