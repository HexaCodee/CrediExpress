// eslint.config.js
import expoConfig from 'eslint-config-expo/flat';

export default [
  ...expoConfig,
  {
    ignores: ['node_modules/**', 'assets/**', '.expo/**'],
  },
];
