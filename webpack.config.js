var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'src/client/public');
var APP_DIR = path.resolve(__dirname, 'src/client/app');

var config = {
  entry: APP_DIR + '/index.tsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json", ".png"]
  },
  plugins: [    
    new HtmlWebpackPlugin ({
      inject: true,
      template: 'src/client/index.html',
    })
  ],
  module: {
    loaders: [
      { 
        test: /\.png?/, 
        include : APP_DIR,
        loader: "file-loader" 
      },
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel-loader'
      },
      {
        test : /\.json?/,
        include : APP_DIR,
        loader : 'json-loader'
      },
      { 
        test: /\.tsx?$|\.ts?$/, 
        include : APP_DIR,
        loader: "ts-loader" 
      }
    ]
  }
};

module.exports = config;
