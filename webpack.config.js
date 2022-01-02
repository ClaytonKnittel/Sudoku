const path = require('path');

module.exports = {
    entry: {
      "main.js": [
        path.resolve(__dirname, './src/main.jsx'),
        path.resolve(__dirname, './src/game_logic.mjs'),
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
        }
      ]
    },
    resolve: {
      extensions: [".js", ".jsx"]
    }
};