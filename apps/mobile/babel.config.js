module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@app': './src/app',
          '@navigation': './src/navigation',
          '@features': './src/features',
          '@domain': './src/domain',
          '@data': './src/data',
          '@ui': './src/ui',
          '@lib': './src/lib',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
