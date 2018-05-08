var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('build', function(){
    return gulp.src([
            'jquery-jvectormap.js',
            'lib/jquery-mousewheel.js',
            'src/jvectormap.js',
            'src/abstract-element.js',
            'src/abstract-canvas-element.js',
            'src/abstract-shape-element.js',
            'src/svg-element.js',
            'src/svg-group-element.js',
            'src/svg-canvas-element.js',
            'src/svg-shape-element.js',
            'src/svg-path-element.js',
            'src/svg-circle-element.js',
            'src/svg-image-element.js',
            'src/svg-text-element.js',
            'src/vml-element.js',
            'src/vml-group-element.js',
            'src/vml-canvas-element.js',
            'src/vml-shape-element.js',
            'src/vml-path-element.js',
            'src/vml-circle-element.js',
            'src/vector-canvas.js',
            'src/simple-scale.js',
            'src/ordinal-scale.js',
            'src/numeric-scale.js',
            'src/color-scale.js',
            'src/legend.js',
            'src/data-series.js',
            'src/proj.js',
            'src/map-object.js',
            'src/region.js',
            'src/marker.js',
            'src/map.js',
            'src/multimap.js'
        ])
        .pipe(concat('jquery.jvectormap.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('jquery.jvectormap.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build'], function(){});


