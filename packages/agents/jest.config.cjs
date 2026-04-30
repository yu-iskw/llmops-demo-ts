/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
    // uuid@14 ships ESM under dist/ and dist-node/; @langchain/core loads it from CJS without pre-transforming.
    "^.+[/\\\\]uuid[/\\\\]dist(-node)?[/\\\\].+\\.js$": [
      "babel-jest",
      {
        presets: [
          [
            "@babel/preset-env",
            {
              targets: { node: "current" },
              modules: "auto",
            },
          ],
        ],
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!.*uuid[/\\\\]dist(-node)?[/\\\\])"],
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};
