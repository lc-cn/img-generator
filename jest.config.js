/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 60000,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$',
    'setup\\.ts$'
  ],
}; 