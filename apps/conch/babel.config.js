module.exports = function (api) {
  api.cache(true)
  const useApiSrc = process.env.EXPO_PUBLIC_USE_API_SRC === '1' || process.env.USE_API_SRC === '1'
  const alias = {
    // runtime: dist via package.json exports (default)
    // dev override: set EXPO_PUBLIC_USE_API_SRC=1 to resolve to src
    ...(useApiSrc ? { '@api': '../../packages/api/src' } : {}),
    '@conch': './',
  }
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias,
        },
      ],
    ],
  }
}
