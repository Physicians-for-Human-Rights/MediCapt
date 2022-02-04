module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.tsx',
            '.json',
            '.native.js',
            '.web.js',
            '.css',
            '.js',
            '.jsx',
          ],
        },
      ],
    ],
  }
}
