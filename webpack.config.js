//@ts-check

'use strict';

const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  name: 'extension',
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },  
  plugins: [
    new copyPlugin({
      patterns: [
        {
          from: '**/*.js',
          to: path.resolve(__dirname, 'dist/mscgenjs-inpage'),
          context: 'node_modules/mscgenjs-inpage/dist/'
        }
      ]
    })
  ],
};

// Build from Mermaid's module entry so the shipped renderer uses the audited
// DOMPurify and KaTeX dependencies, rather than an upstream prebuilt bundle.
/**@type {import('webpack').Configuration}*/
const mermaidConfig = {
  name: 'mermaid',
  target: 'web',
  mode: 'none',
  entry: 'mermaid',
  output: {
    path: path.resolve(__dirname, 'dist/mermaid'),
    filename: 'mermaid.min.js',
    library: { name: 'mermaid', type: 'var', export: 'default' }
  },
  optimization: { splitChunks: false, runtimeChunk: false },
  // Keep lazy diagram loaders in the local bundle for offline webviews.
  plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })]
};

module.exports = [config, mermaidConfig];
