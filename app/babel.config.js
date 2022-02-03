module.exports = function (api) {
  api.cache(true)
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
