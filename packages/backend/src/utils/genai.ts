import { GoogleGenAI } from "@google/genai";

export interface GenAIConfig {
  apiKey?: string;
  vertexai?: boolean;
  project?: string;
  location?: string;
}

export function createGenAIClient(config: GenAIConfig = {}): GoogleGenAI {
  // 1. Start with environment variables as the base
  const envConfig: GenAIConfig = {
    apiKey: process.env.GOOGLE_API_KEY,
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION,
  };

  // 2. Filter out empty/null values from the overriding config (CLI options)
  // so they don't incorrectly override set environment variables.
  const overrideConfig = Object.fromEntries(
    Object.entries(config).filter(
      ([, v]) => v !== null && v !== undefined && v !== "",
    ),
  );

  // 3. Merge the cleaned override config onto the environment config
  const mergedConfig = {
    ...envConfig,
    ...overrideConfig,
  };

  // 4. Determine if we should use Vertex AI.
  // If a project is specified (either from env or CLI), we assume Vertex AI.
  if (mergedConfig.project) {
    mergedConfig.vertexai = true;
  }

  // 5. Final cleanup of properties before passing to the constructor.
  const finalConfig = Object.fromEntries(
    Object.entries(mergedConfig).filter(
      ([, v]) => v !== null && v !== undefined && v !== "",
    ),
  );

  return new GoogleGenAI(finalConfig);
}

export const genAI = createGenAIClient();
