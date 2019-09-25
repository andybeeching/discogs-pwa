const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: {
    server: './src/server/server-local.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  target: 'node',
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false // and __filename return blank or /
  },
  // Need this to avoid error when working with Express
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.m?js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          emitWarning: true,
          failOnError: false,
          failOnWarning: false
        }
      },
      {
        test: /\.gif$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
              // emitFile: false
            }
          }
        ]
      }
    ]
  }
}
