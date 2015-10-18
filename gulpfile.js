var gulp = require('gulp'),
	seq = require('run-sequence'),
	connect = require('gulp-connect'),
	less = require('gulp-less'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	cssmin = require('gulp-cssmin'),
	order = require('gulp-order'),
	concat = require('gulp-concat'),
	ignore = require('gulp-ignore'),
	rimraf = require('gulp-rimraf'),
	templateCache = require('gulp-angular-templatecache'),
	mobilizer = require('gulp-mobilizer'),
	ngAnnotate = require('gulp-ng-annotate'),
	replace = require('gulp-replace'),
	ngFilesort = require('gulp-angular-filesort'),
	streamqueue = require('streamqueue'),
	rename = require('gulp-rename'),
	path = require('path');

var config = {
		dest: 'dist',
		js: {
			libs: [
				'./bower_components/ngtouch/build/ngTouch.min.js',
				'./bower_components/html2canvas/build/html2canvas.js',

			]
		},
		css: {
			libs: []
		}
	}
	;

gulp.task('clean', function (cb) {
	return gulp.src([
		config.dest, 'images'
	], {read: false})
		.pipe(rimraf());
});

gulp.task('html', function () {
	var inject = [];
	gulp.src(['./src/*.html'])
		.pipe(gulp.dest(config.dest));
});

gulp.task('coucou', function () {
	console.log("COUCOU :)");
});

gulp.task('js', function () {
	streamqueue({objectMode: true},
		gulp.src(config.js.libs),
		gulp.src('./src/*.js').pipe(ngFilesort()),
		gulp.src(['src/*.html']).pipe(templateCache({module: 'nablaware'}))
	)
		.pipe(sourcemaps.init())
		.pipe(concat('ionic-issue-reporter.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(config.dest));
});

gulp.task('build', function (done) {
	var tasks = ['js'];
	seq(tasks, done);
});


gulp.task('default', function (done) {
	var tasks = [];

	seq('build', done);
});












