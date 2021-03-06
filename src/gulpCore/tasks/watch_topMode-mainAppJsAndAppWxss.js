const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, projectToSubPackageConfig, program, basePath, currentNamespace, mpTypeNamespace} = require('../preset')
const {writeLastLine} = require('../utils')
const fs = require('fs-extra')
const {runPlugins} = require('../plugins')
const path = require('path')
gulp.task('watch:topMode-mainAppJsAndAppWxss', function () {
    let base = projectToSubPackageConfig[currentNamespace.mainMpPath]
    const cssPathArr = Object.keys(mpTypeNamespace).map((key) => {
        return `${base}/app.${mpTypeNamespace[key].css}`
    })
    const filterAppWxss = $.filter([...cssPathArr], {restore: true})
    const filterAppJs = $.filter([base + '/app.js'], {restore: true})
    return gulp.src([base + '/app.js', ...cssPathArr], {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev',$.watch([base + '/app.js', `${base}/app.${currentNamespace.css}`], {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(filterAppJs)
        .pipe($.replace(/^/, function (match) {
            const uniAppJsContent = fs.readFileSync(basePath + '/app.js', 'utf8')
            return `${uniAppJsContent};\n`
        }, {
            skipBinary: false
        }))
        .pipe(filterAppJs.restore)
        .pipe(filterAppWxss)
        .pipe($.replace(/^/, function (match) {
            const uniAppWxssContent = fs.readFileSync(`${basePath}/app.${currentNamespace.css}`, 'utf8')
            return `${uniAppWxssContent}\n`
        }, {
            skipBinary: false
        }))
        .pipe($.rename(function (path) {
            path.extname = '.' + currentNamespace.css
        }))
        .pipe(filterAppWxss.restore)
        .pipe($.replace(/[\s\S]*/, runPlugins(path.resolve(cwd, target + (program.plugin ? '/miniprogram' : '')))))
        .pipe(gulp.dest(target + (program.plugin ? '/miniprogram' : ''), {cwd}))
})
