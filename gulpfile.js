var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  del = require('del');
var dest = 'dist';
gulp.task('styles', function () {
  return gulp.src('src/styles/**/*.css')
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(concat('jquery.jvectormap.css'))
    .pipe(gulp.dest(dest))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(dest))
    .pipe(notify({ message: 'Styles task complete' }));
});
gulp.task('scripts', function () {
  return gulp.src([
    'src/scripts/jquery-jvectormap.js',
    'src/scripts/jvectormap.js',
    'src/scripts/abstract-element.js',
    'src/scripts/abstract-canvas-element.js',
    'src/scripts/abstract-shape-element.js',
    'src/scripts/svg-element.js',
    'src/scripts/svg-group-element.js',
    'src/scripts/svg-canvas-element.js',
    'src/scripts/svg-shape-element.js',
    'src/scripts/svg-path-element.js',
    'src/scripts/svg-circle-element.js',
    'src/scripts/svg-image-element.js',
    'src/scripts/svg-text-element.js',
    'src/scripts/vml-element.js',
    'src/scripts/vml-group-element.js',
    'src/scripts/vml-canvas-element.js',
    'src/scripts/vml-shape-element.js',
    'src/scripts/vml-path-element.js',
    'src/scripts/vml-circle-element.js',
    'src/scripts/vector-canvas.js',
    'src/scripts/simple-scale.js',
    'src/scripts/ordinal-scale.js',
    'src/scripts/numeric-scale.js',
    'src/scripts/color-scale.js',
    'src/scripts/legend.js',
    'src/scripts/data-series.js',
    'src/scripts/proj.js',
    'src/scripts/map-object.js',
    'src/scripts/region.js',
    'src/scripts/marker.js',
    'src/scripts/map.js'
  ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('jquery.jvectormap.js'))
    .pipe(gulp.dest(dest))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(dest))
    .pipe(notify({ message: 'Scripts task complete' }));
});
gulp.task('clean', function (cb) {
  del([dest], cb)
});
gulp.task('default', ['clean'], function () {
  gulp.start('styles', 'scripts');
});