// @ts-check
import { fileURLToPath } from "url";
import { dirname } from "path";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import eslintReact from "@eslint-react/eslint-plugin";
import sonarjs from "eslint-plugin-sonarjs";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import unicorn from "eslint-plugin-unicorn";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import vuejsAccessibility from "eslint-plugin-vuejs-accessibility";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    ignores: [
      "**/*.d.ts",
      "**/dist/**",
      "**/build/**",
      "**/generated/**",
      "packages/frontend/playwright.config.ts",
      "packages/frontend/vite.config.ts",
      "**/*.spec.ts",
      "logs",
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "lerna-debug.log*",
      "report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json",
      "pids",
      "*.pid",
      "*.seed",
      "*.pid.lock",
      "lib-cov",
      "coverage",
      "*.lcov",
      ".nyc_output",
      ".grunt",
      "bower_components",
      ".lock-wscript",
      "build/Release",
      "node_modules/",
      "jspm_packages/",
      "web_modules/",
      "*.tsbuildinfo",
      ".npm",
      ".eslintcache",
      ".stylelintcache",
      ".node_repl_history",
      "*.tgz",
      ".yarn-integrity",
      ".env",
      ".env.*",
      "!.env.example",
      ".cache",
      ".parcel-cache",
      ".next",
      "out",
      ".nuxt",
      "dist",
      ".cache/",
      ".vuepress/dist",
      ".temp",
      ".cache",
      ".svelte-kit/",
      "**/.vitepress/dist",
      "**/.vitepress/cache",
      ".docusaurus",
      ".serverless/",
      ".fusebox/",
      ".dynamodb/",
      ".firebase/",
      ".tern-port",
      ".vscode-test",
      ".pnp.*",
      ".yarn/*",
      "!.yarn/patches",
      "!.yarn/plugins",
      "!.yarn/releases",
      "!.yarn/sdks",
      "!.yarn/versions",
      "vite.config.js.timestamp-*",
      "vite.config.ts.timestamp-*",
      "packages/**/build/",
      "packages/backend/build/",
      "packages/frontend/dist/",
      ".env",
      "pacckages/**/*.js",
      "packages/frontend/playwright-report/",
      "packages/frontend/test-results/",
    ],
  },
  sonarjs.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
      "@eslint-react": eslintReact,
      prettier,
      unicorn,
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        // project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      ...prettierConfig.rules,
      // Example rules - add more as needed
      "@typescript-eslint/no-unused-vars": "error",
      "@eslint-react/no-missing-key": "error",
      // Disable base ESLint rules that conflict with TypeScript-ESLint
      "no-unused-vars": "off",
      // SonarJS rules
      "sonarjs/no-duplicate-string": "off",
      "prettier/prettier": "warn",
      "unicorn/prevent-abbreviations": "warn",
    },
  },
  ...vue.configs["flat/recommended"],
  {
    languageOptions: {
      parserOptions: {
        parser: tseslintParser,
      },
    },
  },
  {
    files: ["**/*.vue"],
    plugins: {
      prettier,
    },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "warn",
    },
  },
];
