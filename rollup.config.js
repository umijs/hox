module.exports = {
  external: [
    'react',
    'reflect-metadata',
  ],
  input: 'lib/index.js',
  output: {
    name: 'hox',
    globals: {
      react: 'React'
    },
    file: 'lib/umd/hox.js',
    format: 'umd'
  }
}
