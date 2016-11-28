var gulp=require('gulp');
var browserSync=require('browser-sync').create();

//本地服务器
gulp.task('server',function(cb){
    browserSync.init({
        server: {
            baseDir: "./"
        },
        port:8080,
        open:false
    });
    // 自动刷新
    var watch_htm=['./demo/*.htm','./demo/**/*.htm'];
    var watch_js=['./index.js'];
    gulp.watch(watch_htm).on('change', browserSync.reload);
    gulp.watch(watch_js).on('change', browserSync.reload);
});
