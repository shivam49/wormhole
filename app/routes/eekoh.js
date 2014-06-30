var async       = require('async');

exports.get = function (req, res, next) {
  async.parallel({
    eekohs: function (fn) {
      // get a list of the user's eekohs...
      fn(null, ['Politics', 'Sports']);
    },
    visited: function (fn) {
      // get a list of eekoh's that we've visited...
      fn(null, ['Sports', 'Lebron James', 'Obama', 'Politics', 'Rick Perry', 'Florida']);
    }
  }, response);

  function response(err, results) {
    if (err) {
      return next(err);
    }

    res.format({
      html: function() {
        res.render('eekoh', results);
      },
      json: function() {
        res.json(results);
      }
    });
  }
};

exports.post = function (req, res) {
  // Alex.. change this..
  var eekohHash = req.body.eekohHash || '';

  record();

  function record() {
    if (req.isAuthenticated()) {
      return response();
    }

    var tr = req.db.transaction();

    tr.find('eekoh added', {
      article: eekohHash,
      user: req.user._id
    }).then(function (entry) {
      if (entry) {
        var count = parseInt(entry.count, 10);
        if (isNaN(count)) {
          count = 0;
        }

        return tr.put(['eekoh added', entry._id, 'count'], (count+1));
      } else {
        return tr.create('eekoh added', {
          article: eekohHash,
          user: req.user._id,
          count: 1
        });
      }
    });

    tr.commit().then(response);
  }

  function response() {
    res.format({
      html: function() {
        req.flash('success', 'Your eekoh system has been submitted.');
        res.redirect('back');
      },
      json: function() {
        // Alex: place the newely generated article / JSON output here...
        res.json(true);
      }
    });
  }
};
