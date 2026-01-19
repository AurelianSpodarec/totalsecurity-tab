/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@packages/components$': '<rootDir>/packages/components/index.ts',
    '^@packages/ext-api$': '<rootDir>/packages/ext-api/index.ts',
    '^@packages/ext-treedux$': '<rootDir>/packages/ext-treedux/index.ts',
    '^@packages/features$': '<rootDir>/packages/features/index.ts',
    '^@packages/hooks$': '<rootDir>/packages/hooks/index.ts',
    '^@packages/state$': '<rootDir>/packages/state/index.ts',
    '^@packages/tab-manager$': '<rootDir>/packages/tab-manager/index.ts',
    '^@packages/utility$': '<rootDir>/packages/utility/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        jsx: 'react-jsx',
        types: ['jest', 'node', 'chrome-types'],
        baseUrl: '.',
        paths: {
          '@packages/components': ['packages/components/index.ts'],
          '@packages/ext-api': ['packages/ext-api/index.ts'],
          '@packages/ext-treedux': ['packages/ext-treedux/index.ts'],
          '@packages/features': ['packages/features/index.ts'],
          '@packages/hooks': ['packages/hooks/index.ts'],
          '@packages/state': ['packages/state/index.ts'],
          '@packages/tab-manager': ['packages/tab-manager/index.ts'],
          '@packages/utility': ['packages/utility/index.ts'],
        },
      },
    }],
  },
  collectCoverageFrom: [
    'packages/**/*.ts',
    'packages/**/*.tsx',
    '!packages/**/index.ts',
    '!**/*.d.ts',
  ],
};
