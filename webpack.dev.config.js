const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')

module.exports = {
  entry: {
    main: [
      // 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
      './src/index.js'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  // TODO: move this into server.js
  // devServer: {
  //   stats: {
  //     // Remove built modules information.
  //     modules: false,
  //     // Remove built modules information to chunk information.
  //     chunkModules: false,
  //     colors: true
  //   }
  // },
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
        test: /\.m?js$/,
        exclude: [/node_modules/, /sw\.js/],
        loader: 'babel-loader',
        options: {
          configFile: './.babelrc'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // readable module names on HMR
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['!./dist/server.js']
    }),
    // inject built asset name array into SW
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, './src/sw.js')
    })
  ]
}
