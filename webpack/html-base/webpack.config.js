const webpack = require('webpack')
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Create multiple instances
const extractHTML = new ExtractTextPlugin('[name].html');


const PATH = {
  source: path.resolve(__dirname, 'app'),
  output: path.resolve(__dirname, 'public')
}

module.exports = {
  devtool: 'source-map',
  context: PATH.source,
  target: 'web',
  stats: 'errors-only',

  entry: {
    main: 'index.js',
    index: 'pages/index.html?page'
  },

  output: {
    path: PATH.output,
    publicPath: './',
    filename: '[name].bundle.js',
  },

  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'app')
    ],
    extensions: ['.js', '.json', '.jsx', '.css', '.scss', '.sass', '.pug'],
    alias: {
      'containers': path.join(PATH.source, 'containers'),
      'components': path.join(PATH.source, 'components'),
      'core': path.join(PATH.source, 'core'),
      'assets': path.join(PATH.source, 'assets'),
      'styles': path.join(PATH.source, 'styles'),
      'pages': path.join(PATH.source, 'pages'),
    },
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        rules: [
          {
            loader: 'babel-loader'
          },
          {
            resourceQuery: /spawn/,
            loader: 'spawn-loader'
          }
        ],
      },

      /* HTML BUNDLE */
      {
        test: /\.html$/,
        oneOf: [

          /* Export html into file if query string 'page' passed */
          {
            resourceQuery: /page/,
            use: extractHTML.extract({
              use: [
                {
                  loader: 'html-loader',
                  options: {
                    attrs: [
                      'link:href',
                      'script:src',
                      'img:src'
                    ]
                  }
                },
              ]
            })
          },

          {
            loader: 'html-loader',
            options: {}
          },
        ]
      },

      /* STYLES BUNDLE */

      /* IMAGES BUNDLE */
      {
        test: /\.jpe?g$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/images/[name].[ext]',
              publicPath: '/'
            }
          }
        ]
      },
      { test: /\.png$/, use: [ "url-loader?mimetype=image/png" ] }
    ],
  },

  performance: {
    hints: 'warning', // enum
    maxAssetSize: 200000, // int (in bytes),
    maxEntrypointSize: 400000, // int (in bytes)
  },

  devServer: {
    proxy: { // proxy URLs to backend development server
      '/api': 'http://localhost:3000'
    },
    contentBase: PATH.output, // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true, // only errors & warns on hot reload
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    extractHTML
  ],
}