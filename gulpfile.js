const gulp = require('gulp')
const del = require('del')
const rollupConfig = require('./rollup.config')
const rollup = require('rollup')
const ts = require('gulp-typescript')
const through = require('through2')
const tsconfig = require('./tsconfig.json')

gulp.task('clean-lib', function (callback) {
  del('lib/**')
  callback()
})

gulp.task('copy-files', function () {
  return gulp.src(['README.md', 'LICENSE']).pipe(gulp.dest('lib/'))
})

gulp.task('ts-es', function () {
  const tsProject = ts({
    ...tsconfig.compilerOptions,
    module: 'ES6',
  })
  return gulp
    .src(['src/**/*.{ts,tsx}'], {
      ignore: ['**/demos/**/*', '**/tests/**/*'],
    })
    .pipe(tsProject)
    .pipe(gulp.dest('lib/es/'))
})

gulp.task('generate-package-json', function () {
  return gulp
    .src('./package.json')
    .pipe(
      through.obj((file, enc, cb) => {
        const rawJSON = file.contents.toString()
        const parsed = JSON.parse(rawJSON)
        delete parsed.scripts
        delete parsed.devDependencies
        delete parsed.publishConfig
        delete parsed.files
        delete parsed.resolutions
        delete parsed.packageManager
        const stringified = JSON.stringify(parsed, null, 2)
        file.contents = Buffer.from(stringified)
        cb(null, file)
      })
    )
    .pipe(gulp.dest('./lib/'))
})

gulp.task('ts-cjs', function () {
  const tsProject = ts({
    ...tsconfig.compilerOptions,
    module: 'commonjs',
  })
  return gulp
    .src(['src/**/*.{ts,tsx}'], {
      ignore: ['**/demos/**/*', '**/tests/**/*'],
    })
    .pipe(tsProject)
    .pipe(gulp.dest('lib/cjs/'))
})

gulp.task('rollup', async function () {
  const bundle = await rollup.rollup(rollupConfig)
  return await bundle.write(rollupConfig.output)
})

gulp.task(
  'build',
  gulp.series(
    'clean-lib',
    'copy-files',
    'generate-package-json',
    'ts-es',
    'ts-cjs',
    'rollup'
  )
)
