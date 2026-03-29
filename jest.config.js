/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Use the ESM preset for ts-jest
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.js"],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",

  // Specific settings for ESM support
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // Supports imports with .js extensions in TS files
  },
  transform: {
    // Transform TypeScript files using ts-jest with ESM support
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./html-report",
        filename: "test-report.html",
        expand: true,
        pageTitle: "Test Report",
      },
    ],
  ],
};
