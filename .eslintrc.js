module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'simple-import-sort',
        'unused-imports',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'simple-import-sort/imports': 'warn',
        'simple-import-sort/exports': 'warn',
        'unused-imports/no-unused-imports': 'warn',
    },
    ignorePatterns: ['target/', 'node_modules/', 'playwright-report/', 'test-results/', 'generated/', 'codegen/'],
};
