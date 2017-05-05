const path = require('path');
const webpack = require('webpack')

module.exports = {
  devtool: '#source-map'
  , entry : [
    './src/main.js'
  ]
  , output : {
      path : path.join(__dirname, 'public')
      , filename: 'bundle.js'
      , publicPath: '/'
  }
  , devServer: {
    contentBase: 'public/'
    , historyApiFallback: true
    , port: 3355
    , inline: true
    , hot: true
  }
  , plugins : [
    new webpack.HotModuleReplacementPlugin()
  ]
  , module: {
    rules: [
      {
        test: /\.js$/
        , use: "babel-loader"
        , include: path.join(__dirname, 'src')
      }
    ]
  }
};