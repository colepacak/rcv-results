var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: __dirname + "/src",
  devServer: {
    hot: true,
    inline: true,
    progress: true,
    stats: 'errors-only',
    historyApiFallback: true
  },
  watchOptions: {
    poll: true
  },
  devtool: 'source-map',
  resolve: {
    modulesDirectories: ['node_modules']
  },
  entry: {
    javascript:'./entry',
    html: "./index.html"
  },
  output: {
    path: __dirname + "/lib",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /.js?$/,
        loaders: ['react-hot','babel?presets[]=es2015,presets[]=react,presets[]=stage-0'],
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        loaders: ["style", "css", "sass"]
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]"
      }
    ]
  }
};
