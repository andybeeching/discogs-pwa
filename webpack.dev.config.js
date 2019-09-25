const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    main: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
      './src/index.js'
    ],
    // mock out service worker
    '__mocks__/moduleMock.js': './__mocks__/moduleMock.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
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
        test: /\.(png|svg|jpg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // readable module names on HMR
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['!./dist/server.js']
    }),
    // ignore service worker import in main target
    // this is because SW.js and HMR don't play nicely
    new webpack.NormalModuleReplacementPlugin(
      /serviceworker-webpack-plugin/,
      path.resolve(__dirname, './__mocks__/moduleMock.js')
    ),
    // generate web manifest
    new WebpackPwaManifest({
      fingerprints: false,
      name: 'Discogs PWA',
      inject: 'false',
      short_name: 'Discogs PWA',
      orientation: 'omit',
      description: 'A PWA for exploring Discogs',
      theme_color: '#333333',
      background_color: '#ffffff',
      crossorigin: null,
      icons: [
        {
          src: path.resolve('./src/css/img/vinyl.svg'),
          sizes: [36, 48, 72, 96, 120, 128, 152, 167, 180, 256, 384, 1024] // multiple sizes
        },
        {
          src: path.resolve('./src/css/img/vinyl.png'),
          sizes: [144, 512]
        }
      ]
    }),
    // copies gifs+favicons for error pages to dist folder
    new CopyPlugin([
      {
        from: './src/img',
        to: './',
        toType: 'dir'
      }
    ])
  ]
}
