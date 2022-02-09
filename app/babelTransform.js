const { default: babelJest } = require('babel-jest')

module.exports = babelJest.createTransformer({
  configFile: false,
  presets: ['./babel.config.js'],
})
