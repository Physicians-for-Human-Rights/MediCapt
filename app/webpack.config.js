const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const path = require('path')
// npm i -D @expo/webpack-config

module.exports = async function (env, argv) {
  let config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components'],
      },
    },
    argv
  )
  // let config = await createExpoWebpackConfigAsync(env, argv)
  // config.resolve.alias['moduleA'] = 'moduleB'

  // // Maybe you want to turn off compression in dev mode.
  // if (config.mode === 'development') {
  //   config.devServer.compress = false
  // }

  // // Or prevent minimizing the bundle when you build.
  // if (config.mode === 'production') {
  //   config.optimization.minimize = false
  // }
  // config.module.rules = [{ test: /\.txt$/, use: 'raw-loader' }]
  // console.log({ config })

  // Use the React refresh plugin in development mode
  if (env.mode === 'development') {
    config.plugins.push(new ReactRefreshWebpackPlugin())
  }

  return config
}
