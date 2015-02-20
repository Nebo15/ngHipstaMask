var gulp = require('gulp'),
    karma = require('karma').server,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    tinylr = require('tiny-lr')(),
    connect = require('gulp-connect'),
    sourceFilesApi = [
      'src/mbank.lib.angular/mbank.lib.angular.prefix',
      'src/mbank.lib.angular/mbank.lib.angular.js',
      'src/mbank.lib.angular/services/$mbankApi.js',
      'src/mbank.lib.angular/mbank.lib.angular.suffix'
    ],

    sourceFilesAdminApi = [
        'src/mbank.lib.angular/mbank.lib.angular.prefix',
        'src/mbank.lib.angular/mbank.lib.admin.angular.js',
        'src/mbank.lib.angular/services/$mbankAdminApi.js',
        'src/mbank.lib.angular/mbank.lib.angular.suffix'
    ];
    git = require('gulp-git'),
    runSequence = require('gulp-run-sequence'),
    rmdir = require('rimraf'),
    chug = require( 'gulp-chug' );

gulp.task('build', function() {
  gulp.src(sourceFilesApi)
    .pipe(concat('mbanklibangular.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('mbanklibangular.min.js'))
    .pipe(gulp.dest('./dist'));

  gulp.src(sourceFilesAdminApi)
    .pipe(concat('mbankadminlibangular.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('mbankadminlibangular.min.js'))
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
    gulp.watch(['gulpfile.js', sourceFilesApi, sourceFilesAdminApi, 'test/**/*', 'examples/**/*'], ['default']);
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

gulp.task('clone-bower-component', function (cb) {
    git.clone('https://github.com/Nebo15/mbank.lib.angular-compiled', {args: 'dist'}, cb);
});

gulp.task('clean', function (cb) {
    rmdir('dist', cb);
});

gulp.task('publish-bower-package', function (cb) {
    gulp.src( './dist/gulpfile.js' )
        .pipe( chug({
            tasks: ['update-changes']
        }) );
});

gulp.task('serve', ['default','webserver', 'watch']);
gulp.task('build-lib', function (cb) {
    runSequence('clean','test-src','clone-bower-component','build', cb);
})
gulp.task('default', ['build-lib']);
gulp.task('publish', function (cb) {
  runSequence('build-lib','publish-bower-package', cb);
});
