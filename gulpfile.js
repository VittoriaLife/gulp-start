const {src, dest, watch, parallel, series} = require('gulp');
const css = require('gulp-sass')(require('sass')); // scss to css
const plumber = require('gulp-plumber'); // не прекращение выполнения кода при возниконовении ошибки
const postcss = require('gulp-postcss'); // for css plugins
const autoprefixer = require('autoprefixer') // prefixes for browsers
const cssImport = require('postcss-import'); // import css files 
const mediaminmax = require('postcss-media-minmax'); // >=, <=
// const minCss = require('postcss-csso'); // a CSS minifier
const rename = require('gulp-rename'); // rename files
const htmlmin = require('gulp-htmlmin'); // a html minifier
const browserSync = require('browser-sync').create(); 
const babel = require('gulp-babel');
const terser = require('gulp-terser'); // compresses es6+ code
const del = require('del');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');



//HTML

const html = () => {
  return src('src/*.html')
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true
    }))
    .pipe(dest('dist'))
};

exports.html = html;



// Styles 

const styles = () => {
  return src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(css({outputStyle: 'compressed'}))
    .pipe(postcss([
      cssImport(),
      mediaminmax(),
      autoprefixer()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream());
};

exports.styles = styles;



// Scripts 

const scripts = () => {
  return src('src/js/main.js')
    .pipe(babel({
      presets:['@babel/preset-env']
    }))
    .pipe(terser())
    .pipe(rename('main.min.js'))
    .pipe(dest('src/js'))
    .pipe(browserSync.stream());
};

exports.scripts = scripts;



// Images 

const images = () => {
  return src('src/img/**/*.{png, jpg, jpeg, svg}')
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 85, progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo({
      plugins: [
        {removeViewBox: true},
        {cleanupIDs: false}
      ]
    })
  ]))
  .pipe(dist('src/img'));
};

exports.images = images;



// WebP 

const createWepb = () => {
  return src('src/img/**/*.{jpg, png, jpeg}')
    .pipe(webp({quality: 90}))
    .pipe(dest('src/img'));
};

exports.createWepb = createWepb;



// Copy

const copy = () => {
  return src([
    'src/css/style.min.css',
    'src/fonts/*',
     'src/img/*',
    'src/js/main.min.js'
  ],{
    base: 'src/'
  })
  .pipe(dest('dist'));
};

exports.copy = copy;



// Server 

const browsersync = () => {
  browserSync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: 'src/'
    }
  });
};

exports.browsersync = browsersync;



// Watch 

const watching = () => {
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/js/**/*.js'], scripts);
  watch(['src/*.html']).on('change', browserSync.reload);
};

exports.watching = watching;


// cleanDist

const cleanDist = () => {
  return del('dist')
};

exports.cleanDist = cleanDist;

exports.test = parallel(styles, scripts, browsersync, watching);
exports.build = series(cleanDist, scripts, styles, createWepb, copy, html);