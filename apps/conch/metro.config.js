const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = path.resolve(__dirname)
const monoRepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)
const { transformer, resolver } = config

config.watchFolders = [monoRepoRoot]
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
}
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  nodeModulesPaths: [
    path.resolve(monoRepoRoot, 'node_modules'),
    path.resolve(projectRoot, 'node_modules'),
  ]
}

module.exports = config
