const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

module.exports = {
  external: ['react'],
  input: 'lib/es/index.js',
  output: {
    name: 'hox',
    globals: {
      react: 'React',
    },
    file: 'lib/umd/hox.js',
    format: 'umd',
  },
  plugins: [nodeResolve(), commonjs()],
}
