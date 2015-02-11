var gulp = require('gulp'),
    karma = require('karma').server,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    tinylr = require('tiny-lr')(),
    connect = require('gulp-connect'),
    sourceFiles = [
      'src/mbank.lib.angular/mbank.lib.angular.prefix',
      'src/mbank.lib.angular/mbank.lib.angular.js',
      'src/mbank.lib.angular/**/*.js',
      'src/mbank.lib.angular/mbank.lib.angular.suffix'
    ],
    git = require('gulp-git');

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(concat('mbanklibangular.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('mbanklibangular.min.js'))
    .pipe(gulp.dest('./dist'))
});

/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-concatenated.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-minified.conf.js',
    singleRun: true
  }, done);
});
/**
 * Watching for change
 */
gulp.task('watch', function() {
    gulp.watch(['gulpfile.js', sourceFiles, 'test/**/*', 'examples/**/*'], ['default']);
});
/**
 * LIVERELOAD
 */
gulp.task('livereload', function() {
    tinylr.listen(4002);
});
gulp.task('webserver', function() {
    connect.server({
        livereload: true,
        port: 8080,
        host: '0.0.0.0'
    });
});

gulp.task('clone-bower-component', function () {
    git.clone('https://github.com/Nebo15/mbank.lib.angular-compiled', {args: 'dist'}, function (err) {
        if (err) throw err;
    });
});

gulp.task('serve', ['default','webserver', 'watch']);
gulp.task('default', ['test-src','clone-bower-component','build']);
gulp.task('bower-component-publish', ['test-src','clone-bower-component','build']);
