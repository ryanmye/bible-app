/**
 * Node-based Jest config for domain + repository + parser tests.
 *
 * We intentionally do NOT use the react-native preset here so the foundation
 * tests can run in CI without needing native modules like op-sqlite. When we
 * add component tests later, we can re-introduce the RN project.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx,js,jsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },
};
