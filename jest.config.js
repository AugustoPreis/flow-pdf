module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  passWithNoTests: true,
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};