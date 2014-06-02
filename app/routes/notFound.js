module.exports = {
  method: '*',
  path: '/{path*}',
  handler: function (request, reply) {
    reply('The route was not found').code(404);
  }
};
