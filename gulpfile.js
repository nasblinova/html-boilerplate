"use strict";

var gulp = require('gulp'),
	pug = require('gulp-pug'),
	scss = require('gulp-sass'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	prefix = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	cssImport = require('gulp-cssimport'),
	cmq = require('gulp-group-css-media-queries'),
	spritesmith  = require('gulp.spritesmith'),
	iconfont= require('gulp-iconfont'),
	iconfontCss  = require('gulp-iconfont-css'),
	svgSprite    = require('gulp-svg-sprite'),
	svgmin       = require('gulp-svgmin'),
	browserSync = require('browser-sync').create(),
	argv = require('yargs').argv,
	rename = require('gulp-rename');

var useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	cssmin = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	rimraf = require('rimraf'),
	notify = require('gulp-notify'),
	ftp = require('vinyl-ftp');

var paths = {
	blocks: 'blocks/',
	devAssetsDir: 'public/assets/',
	devDir: 'public/',
	outputDir: 'build/'
};

var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var browserSyncReuseTab = require('browser-sync-reuse-tab')(browserSync)

var prod = argv.prod || false;

/*********************************
 Developer tasks
 *********************************/

//pug compile
gulp.task('pug', function() {
	return gulp.src([paths.blocks + '*.pug', '!' + paths.blocks + 'template.pug' ])
		.pipe(plumber())
		.pipe(pug({
			pretty: true,
			data: { prod: prod, version: 'v0.0.6' }
		}))
		.pipe(gulp.dest(paths.devDir))
		.pipe(gulpif(!prod, browserSync.stream()))
});

//scss compile
gulp.task('scss', function() {
	return gulp.src(paths.blocks + '*.scss')
		.pipe(plumber())
		.pipe(gulpif(!prod, sourcemaps.init()))
		.pipe(scss().on('error', scss.logError))
		.pipe(gulpif(!prod, sourcemaps.write('.')))			
		.pipe(gulpif(prod, cssImport()))
		.pipe(gulpif(prod, cmq()))
		.pipe(gulpif(prod, prefix({
			browsers: ['last 10 versions'],
			cascade: true
		})))
		.pipe(gulpif(prod, cssmin()))
		.pipe(gulpif(prod, rename({suffix: '.min'})))
		.pipe(gulp.dest(paths.devAssetsDir + 'css/'))
		.pipe(gulpif(!prod, browserSync.stream()))
});

//js compile
gulp.task('scripts', function() {
	var bundle = 'main.js';
	if (prod) bundle = 'main.min.js';
	return gulp.src([
		paths.blocks + '**/!(main)*.js',
		'!' + paths.blocks + '_assets/**/*.js',
		'!' + paths.blocks + 'js-libs/*.js',
		paths.blocks + 'main.js',
	])
		.pipe(plumber())
		.pipe(gulpif(!prod, sourcemaps.init()))
		.pipe(babel({
			presets: ['babel-preset-env']
		}))
		.pipe(concat(bundle))
		.pipe(gulpif(!prod, sourcemaps.write('.')))
		.pipe(gulpif(prod, uglify()))
		.pipe(gulp.dest(paths.devAssetsDir + 'js/'))
		.pipe(gulpif(!prod, browserSync.stream()))
});

//js compile
gulp.task('scripts-libs', function() {
	return gulp.src([
		paths.blocks + 'js-libs/*.js'
	])
		.pipe(concat('libs-bundle.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.devAssetsDir + 'js/'))
		.pipe(gulpif(!prod, browserSync.stream()))
});

//watch
gulp.task('watch', function() {
	gulp.watch(paths.blocks + '**/*.pug', ['pug']);
	gulp.watch(paths.blocks + '**/*.scss', ['scss']);
	gulp.watch(paths.blocks + '**/*.js', ['scripts', 'scripts-libs']);
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3006,
		server: {
			baseDir: paths.devDir
		},
		open: false // do not automatically open browser
	}, browserSyncReuseTab);
});

/*********************************
 Production tasks
 *********************************/

//clean
gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});

//css + js
gulp.task('build', ['clean'], function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe( useref() )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
});

//copy images to outputDir
gulp.task('imgBuild', ['clean'], function() {
	return gulp.src(paths.devAssetsDir + 'img/**/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest(paths.outputDir + 'img/'));
});

//copy fonts to outputDir
gulp.task('fontsBuild', ['clean'], function() {
	return gulp.src(paths.devAssetsDir + '/fonts/**/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});




//default
gulp.task('default', ['browser-sync', 'watch', 'pug', 'scss', 'scripts-libs', 'scripts']);

//production
gulp.task('prod', ['pug', 'scss', 'scripts-libs', 'scripts']);
