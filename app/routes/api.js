exports.user = function (req, res) {
  res.json(req.user._id);
};

exports.users = function (req, res) {
  req.db.find('users', function () {
    return true;
  }).then(function (users) {
    res.json(users);
  });
};

exports.eekoh = function (req, res) {
  req.db.find([ 'user', req.user._id, 'eekoh' ], function () { 
    return true;
  }).then(function (articles) {
    res.json(articles);
  });
};
