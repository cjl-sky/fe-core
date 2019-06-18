const gulp = require('gulp');
const watch = require('gulp-watch');

gulp.task('watch', () => {
  // test
  watch(['lib/**/*.js', 'util/**/*.js', 'test/**/*.js'], function() {
    gulp.start('test');
  });
});

// dev
gulp.task('dev', () => {
  gulp.start('watch');
});
