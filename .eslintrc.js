module.exports = {
    root: true,
    env: {
        node: true,
        es2020: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'indent': ['error', 2],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always']
    },
};