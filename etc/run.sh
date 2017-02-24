#!/bin/ash
set -e
npm link webpack babel-loader babel-core babel-preset-es2015 babel-preset-react react react-dom html-webpack-plugin file-loader json-loader ts-loader typescript
webpack -d --watch

