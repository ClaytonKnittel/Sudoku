const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
      "main.js": [
        path.resolve(__dirname, './src/main.jsx'),
        path.resolve(__dirname, './src/game_logic.js')
      ]
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public')
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ['babel-loader']
          // use: {
          //   loader: "babel-loader",
          //   options: {
          //     cacheDirectory: true,
          //     cacheCompression: false,
          //     envName: "production"
          //   }
          // }
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx"]
    }
};