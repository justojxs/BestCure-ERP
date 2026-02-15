import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,

    // ─── Ignore patterns ───
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
    },

    // ─── Backend (Node.js) ───
    {
        files: ['backend/**/*.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: ['error', 'always'],
        },
    },

    // ─── Frontend (React/Browser) ───
    // Note: Without @eslint/plugin-react, JSX components may appear as "unused".
    // We relax no-unused-vars for frontend files to avoid false positives on
    // component imports and JSX expressions.
    {
        files: ['frontend/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: ['error', 'always'],
        },
    },

    // ─── Test files ───
    {
        files: ['backend/__tests__/**/*.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
];
