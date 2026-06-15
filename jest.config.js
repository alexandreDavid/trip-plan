/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    // Mock du SDK Firestore (on ne teste que la logique pure).
    '^firebase/firestore$': '<rootDir>/test/mocks/firestore.ts',
    // Alias de chemins du projet.
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // ts-jest compile en CommonJS : pas besoin de transformer les node_modules ESM.
  clearMocks: true,
  // Cache hors du tmp système (évite les soucis de permissions selon l'environnement).
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
};
