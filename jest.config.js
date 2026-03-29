export default {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
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
