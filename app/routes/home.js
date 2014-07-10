
exports.splash = function(req, res) {
  res.cookie('seenSplash', '1', { maxAge: 900000, httpOnly: false});
  res.render('splash');
};
