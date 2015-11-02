const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

const DEVELOPMENT = (process.env.NODE_ENV === 'development')

gulp.task('js', function () {
  return browserify('./src/index.js', { debug: DEVELOPMENT })
    .transform(babelify.configure({
      sourceMaps: DEVELOPMENT
    }))
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(plugins.uglify())
    .pipe(gulp.dest('./dist'))
})
