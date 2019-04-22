const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()

gulp.task('views', () => {
  return gulp.src('./views/index.jade')
    .pipe(plugins.jade({
      locals: {
        env: process.env
      },
      pretty: (process.env.NODE_ENV === 'development')
    }))
    .pipe(gulp.dest('./'))
})
