var plugins = {
  '../models': null,

  // Jade Helpers Functions
  './jade': null,

  // Yar
  yar: {
    cookieOptions: {
      password: 'eekoh',
      isSecure: false
    }
  }
};

module.exports = function (server) {
  server.pack.require(plugins, function (err) {
    if (err) {
      throw err;
    }
  });
};
