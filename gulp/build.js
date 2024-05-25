const gulp = require("gulp");

// SASS
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const webpCss = require("gulp-webp-css");

const clean = require("gulp-clean");
const fs = require("fs");
const groupMedia = require("gulp-group-css-media-queries");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const changed = require("gulp-changed");

// Images
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");

gulp.task("clean:build", function (done) {
  if (fs.existsSync("./dist/")) {
    return gulp.src("./dist/", { read: false }).pipe(clean({ force: true }));
  }
  done();
});

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

gulp.task("sass:build", function () {
  return gulp
    .src("./src/public/scss/*.scss")
    .pipe(changed("./dist/css/"))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(autoprefixer())
    .pipe(sassGlob())
    .pipe(webpCss())
    .pipe(groupMedia())
    .pipe(sass())
    .pipe(csso())
    .pipe(gulp.dest("./dist/css/"));
});

gulp.task("images:build", function () {
  return gulp
    .src("./src/public/img/**/*")
    .pipe(changed("./dist/img/"))
    .pipe(webp())
    .pipe(gulp.dest("./dist/img/"))
    .pipe(gulp.src("./src/public/img/**/*"))
    .pipe(changed("./dist/img/"))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./dist/img/"));
});

gulp.task("fonts:build", function () {
  return gulp.src("./src/public/fonts/**/*").pipe(changed("./dist/fonts/")).pipe(gulp.dest("./dist/fonts/"));
});

gulp.task("files:build", function () {
  return gulp.src("./src/public/files/**/*").pipe(changed("./dist/files/")).pipe(gulp.dest("./dist/files/"));
});

gulp.task("sounds:build", function () {
  return gulp.src("./src/public/sounds/**/*").pipe(changed("./dist/sounds/")).pipe(gulp.dest("./dist/sounds/"));
});

gulp.task("libs:build", function () {
  return gulp.src("./src/public/libs/**/*").pipe(changed("./dist/libs/")).pipe(gulp.dest("./dist/libs/"));
});

gulp.task("js:build", function () {
  return gulp
    .src("./src/public/js/*.js")
    .pipe(changed("./dist/js/"))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(webpack(require("../webpack.config.js")))
    .pipe(gulp.dest("./dist/js/"));
});
