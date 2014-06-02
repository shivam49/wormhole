var gulp = require('gulp'),
    gutil = require('gulp-util'),
    path = require('path'),
    Spawner = require('./lib/spawner'),
    sass = require('component-sass'),
    component = require('gulp-component'),
    livereload = require('gulp-livereload'),
    requireDir = require('./lib/requireDir');

// Load Gulp Tasks
requireDir('gulp/tasks');

sass.loadPath([
  path.join(__dirname, 'lib', 'sass')
]);

gulp.task('component', function () {
  gulp.src(path.join(__dirname, 'component.json'))
  .pipe(component({
    configure: function (builder) {
      builder.use(sass);
    },
    out: path.join(__dirname, 'public', 'assets')
  })).on('error', function (error) {
    gutil.log(gutil.colors.red('[Error]'), 'SASS');
    console.error(error);
  })
  .pipe(gulp.dest('public'));
});

gulp.task('watch', [ 'component' ], function () {
  var server = livereload(),
      child = new Spawner('./index'),
      restarting = false,
      files = [];

  child.on('online', function () {
    var path = files.shift();
    while (path) {
      server.changed(path);
      path = files.shift();
    }
    restarting = false;
    gutil.log(gutil.colors.yellow('[HAPI]'), 'Restarted');
  });

  child.on('error', function () {
    restarting = false;
  });

  gulp.watch([
    'index.js',
    'app/routes/*.js',
    'app/plugins/**/*.js'
  ]).on('change', function (file) {
    gutil.log(gutil.colors.blue('[Watch]'), file.path);
    files.push(file.path);
    if (! restarting) {
      restarting = true;
      child.restart();
    }
  });

  gulp.watch([
    'component.json',
    'modules/**/**/*.json',
    'modules/**/**/*.js',
    'modules/**/**/*.sass',
    'modules/**/**/*.jade',
    'app/views/*.jade'
  ], [ 'component' ]).on('change', function (file) {
    gutil.log(gutil.colors.blue('[Watch]'), file.path);
    server.changed(file.path);
  });
});

gulp.task('default', [ 'watch' ]);
