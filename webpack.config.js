module.exports = {
  entry: './public/src/index.js',
  output: {
    path: 'public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.html$/, loader: 'html'}
    ]
  },
  plugins: []
}
