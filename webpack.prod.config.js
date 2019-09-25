const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')
const WebpackPwaManifest = require('webpack-pwa-manifest')

module.exports = {
  entry: {
    main: './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].[chunkhash:6].js'
  },
  mode: 'production',
  target: 'web',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
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
  optimization: {
    // loads CSS into one file which can be referenced via webpack stats
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'main',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    // minimises JS - favour Terser JS over Uglify as supports ES6+
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        cache: true,
        sourceMap: true
      }),
      // minimises CSS
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['!server.js']
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash:6].css'
    }),
    // inject built asset name array into SW
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, './src/sw.js')
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // generate web manifest
    new WebpackPwaManifest({
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
    })
  ]
}
