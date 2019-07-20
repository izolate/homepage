const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()

gulp.task('watch', function() {
  gulp.watch('./static/styl/**/*.styl', ['css'])
  gulp.watch('./src/**/*.js', ['js'])
  gulp.watch('./views/**/*.jade', ['views'])
})
