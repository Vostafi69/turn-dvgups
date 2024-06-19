const gulp = require("gulp");

// Tasks
require("./gulp/dev.js");
require("./gulp/build.js");

gulp.task(
  "default",
  gulp.series(
    "clean:dev",
    gulp.parallel("sass:dev", "images:dev", "fonts:dev", "files:dev", "libs:dev", "js:dev", "sounds:dev"),
    gulp.parallel("watch:dev", "server:dev")
  )
);

gulp.task(
  "build",
  gulp.series(
    "clean:build",
    gulp.parallel("sass:build", "images:build", "fonts:build", "files:build", "libs:build", "js:build", "sounds:build")
  )
);
