import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/utils/logger.ts',
    '!src/queue/MessageQueue.ts',
    '!src/config/env.ts',
    '!src/services/WhatsAppClient.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        noImplicitAny: false,
        strict: false,
      }
    }
  }
};

export default config;