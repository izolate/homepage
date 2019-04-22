require('dotenv').load()
const gulp = require('gulp')

// require individual tasks
require('require-dir')('./gulp', {
  recurse: true
})

const tasks = ['css', 'js', 'views']

gulp.task('develop', tasks.concat(['watch']))
gulp.task('build', tasks)
