const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const changed = require("gulp-changed");
const nodemon = require("gulp-nodemon");

gulp.task("clean:dev", function (done) {
  if (fs.existsSync("./dev/")) {
    return gulp.src("./dev/", { read: false }).pipe(clean({ force: true }));
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

gulp.task("sass:dev", function () {
  return gulp
    .src("./src/public/scss/*.scss")
    .pipe(changed("./dev/css/"))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./dev/css/"));
});

gulp.task("images:dev", function () {
  return gulp
    .src("./src/public/img/**/*")
    .pipe(changed("./dev/img/"))
    .pipe(gulp.dest("./dev/img/"));
});

gulp.task("fonts:dev", function () {
  return gulp
    .src("./src/public/fonts/**/*")
    .pipe(changed("./dev/fonts/"))
    .pipe(gulp.dest("./dev/fonts/"));
});

gulp.task("files:dev", function () {
  return gulp
    .src("./src/public/files/**/*")
    .pipe(changed("./dev/files/"))
    .pipe(gulp.dest("./dev/files/"));
});

gulp.task("libs:dev", function () {
  return gulp
    .src("./src/public/libs/**/*")
    .pipe(changed("./dev/libs/"))
    .pipe(gulp.dest("./dev/libs/"));
});

gulp.task("js:dev", function () {
  return gulp
    .src(["./src/public/js/*.js", "./src/public/js/*.jsx"])
    .pipe(changed("./dev/js/**/*"))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(webpack(require("./../webpack.config.js")))
    .pipe(gulp.dest("./dev/js/"));
});

gulp.task("server:dev", function () {
  nodemon({
    script: "./src/index.js",
    ext: "js",
    ignore: ["./node_modules/**"],
  });
});

gulp.task("watch:dev", function () {
  gulp.watch("./src/public/scss/**/*.scss", gulp.parallel("sass:dev"));
  gulp.watch("./src/public/img/**/*", gulp.parallel("images:dev"));
  gulp.watch("./src/public/fonts/**/*", gulp.parallel("fonts:dev"));
  gulp.watch("./src/public/files/**/*", gulp.parallel("files:dev"));
  gulp.watch("./src/public/libs/**/*", gulp.parallel("libs:dev"));
  gulp.watch("./src/public/js/**/*.js", gulp.parallel("js:dev"));
});
