module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "@agents/(.*)": "<rootDir>/src/agents/$1",
    "@models/(.*)": "<rootDir>/src/models/$1",
    "@services/(.*)": "<rootDir>/src/services/$1",
    "@utils/(.*)": "<rootDir>/src/utils/$1",
    "@graph": "<rootDir>/src/graph.ts",
    "@llmops-demo/common": "<rootDir>/../common/dist",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
