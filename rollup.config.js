module.exports = {
  external: ['react'],
  input: 'lib/es/index.js',
  output: {
    name: 'hox',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    file: 'lib/umd/hox.js',
    format: 'umd',
  },
}
