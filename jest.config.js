/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    transform: {},
    testMatch: ['**/backend/__tests__/**/*.test.js'],
    globalSetup: './backend/__tests__/globalSetup.js',
    globalTeardown: './backend/__tests__/globalTeardown.js',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/__tests__/**',
        '!backend/seed.js',
    ],
    testTimeout: 30000,
    verbose: true,
};
