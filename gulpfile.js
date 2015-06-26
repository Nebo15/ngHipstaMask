var gulp = require('gulp'),
    karma = require('karma').server,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    tinylr = require('tiny-lr')(),
    connect = require('gulp-connect'),
    git = require('gulp-git'),
    sourceFiles = [
      'src/mask/mask.prefix',
      'src/mask/mask.js',
      'src/mask/**/*.js',
      'src/mask/mask.suffix'
    ],
    runSequence = require('gulp-run-sequence'),
    rmdir = require('rimraf'),
    chug = require( 'gulp-chug' ),
    path = require('path'),
    sass = require('gulp-sass'),
    minifyCSS = require('gulp-minify-css'),
    plumber = require('gulp-plumber');
    notify = require('gulp-notify');


var _libName = 'ngMask';
/**
 * SASS
 */

var onError = function(err) {
  console.log(err);
};

gulp.task('sass', function () {
  gulp.src('./src/**/*.sass')
    .pipe(sass({indentedSyntax: true}))
    .pipe(gulp.dest('./.tmp/css'))
    .pipe(concat(_libName +'.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(minifyCSS())
    .pipe(rename(_libName + '.min.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['sass']);

gulp.task('styles', function() {
  return gulp.src('./src/**/*.sass')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(compass({
      css: '.tmp',
      sass: './src/mask/styles'
    }))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('copy:css', function() {
  gulp.src('./.tmp/**/*.css')
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(concat(_libName +'.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename(_libName +'.min.js'))
    .pipe(gulp.dest('./dist'));
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
    gulp.watch(['./src/mask/styles/**/*'], ['sass']);
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

gulp.task('clean', function (cb) {
    rmdir('dist', cb);
});

gulp.task('serve', ['default','webserver', 'watch']);
gulp.task('build-lib', function (cb) {
    runSequence('clean','test-src','build', cb);
});
gulp.task('default', ['build-lib', 'sass']);
