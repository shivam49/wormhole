exports.users = function (req, res) {
  req.db.find('users', function () {
    return true;
  }).then(function (users) {
    res.json(users);
  });
};

exports.viewed = function (req, res) {
  req.db.find('articles viewed', {
    user: req.params.id
  }).then(function (articles) {
    res.json(articles);
  });
};
