module.exports = {
  env: { browser: true, es2020: true },
  extends: ['../.eslintrc', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)',
      },
    ],
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': 'error',
    'import/exports-last': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2,
        maxEOF: 0,
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '{react-dom,react-dom/**,react}',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@schema/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '*.{css,svg}',
            patternOptions: { matchBase: true },
            group: 'type',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: [],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
