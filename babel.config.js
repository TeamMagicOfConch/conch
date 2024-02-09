module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@containers': './src/containers',
          '@modules': './src/modules',
          '@scenes': './src/scenes',
          '@utils': './src/utils',
          '@assets': './src/assets',
        },
      },
    ],
  ],
}
