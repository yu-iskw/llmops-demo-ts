import { GoogleGenAI } from "@google/genai";
import { traceable } from "langsmith/traceable";
import { logger } from "@llmops-demo/common";

export interface GenAIConfig {
  apiKey?: string;
  vertexai?: boolean;
  project?: string;
  location?: string;
}

let genAI: GoogleGenAI | null = null;

/**
 * Creates and returns a GoogleGenAI client configured for Gemini API (API Key).
 *
 * This function initializes the GoogleGenAI client with an API key for the
 * Gemini Developer API and applies LangSmith tracing to the generateContent method.
 */
export function getGeminiAPIClient(apiKey: string): GoogleGenAI {
  logger.info("Initializing GoogleGenAI client with API key...");
  try {
    const client = new GoogleGenAI({
      vertexai: false,
      apiKey,
    });

    // Apply traceable wrapper to generateContent
    client.models.generateContent = traceable(
      client.models.generateContent.bind(client.models),
      {
        run_type: "llm",
      },
    );

    return client;
  } catch (error) {
    logger.error("Failed to initialize Gemini API client:", error);
    throw new Error(
      "Gemini API client initialization failed. Please check your API key.",
    );
  }
}

/**
 * Creates and returns a GoogleGenAI client configured for Vertex AI.
 *
 * This function initializes the GoogleGenAI client with Vertex AI configuration
 * and applies LangSmith tracing to the generateContent method.
 */
export function getVertexAIClient(
  project: string,
  location: string,
): GoogleGenAI {
  logger.info("Initializing GoogleGenAI client with Vertex AI...");
  try {
    const client = new GoogleGenAI({
      vertexai: true,
      googleAuthOptions: {
        projectId: project,
      },
      location,
    });

    // Apply traceable wrapper to generateContent
    client.models.generateContent = traceable(
      client.models.generateContent.bind(client.models),
      {
        run_type: "llm",
      },
    );

    return client;
  } catch (error) {
    logger.error("Failed to initialize Vertex AI client:", error);
    throw new Error(
      "Vertex AI client initialization failed. Please check your Google Cloud credentials.",
    );
  }
}

/**
 * Initializes and returns a GoogleGenAI client based on the provided configuration.
 *
 * This function delegates to the appropriate client initialization function
 * based on whether Vertex AI or Gemini API should be used.
 */
export function initializeGenAIClient(config: GenAIConfig = {}): GoogleGenAI {
  logger.info("Initializing GoogleGenAI client...");
  try {
    const finalApiKey = config.apiKey || process.env.GOOGLE_API_KEY;
    const finalProject = config.project || process.env.GOOGLE_CLOUD_PROJECT;
    const finalLocation = config.location || process.env.GOOGLE_CLOUD_LOCATION;
    const finalUseVertexAI =
      config.vertexai || process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";

    const useVertexAI = finalUseVertexAI && !!finalProject && !!finalLocation;

    logger.debug("--- initializeGenAIClient debug ---");
    logger.debug("config.project:", config.project);
    logger.debug("config.location:", config.location);
    logger.debug(
      "process.env.GOOGLE_CLOUD_PROJECT:",
      process.env.GOOGLE_CLOUD_PROJECT,
    );
    logger.debug(
      "process.env.GOOGLE_CLOUD_LOCATION:",
      process.env.GOOGLE_CLOUD_LOCATION,
    );
    logger.debug("finalProject:", finalProject);
    logger.debug("finalLocation:", finalLocation);
    logger.debug("finalUseVertexAI:", finalUseVertexAI);
    logger.debug("useVertexAI:", useVertexAI);
    logger.debug("--- end initializeGenAIClient debug ---");

    if (useVertexAI) {
      return getVertexAIClient(finalProject!, finalLocation!);
    } else {
      return getGeminiAPIClient(finalApiKey!);
    }
  } catch (error) {
    logger.error("Failed to initialize GoogleGenAI client:", error);
    throw new Error(
      "GoogleGenAI client initialization failed. Please check your environment variables (e.g., GOOGLE_API_KEY or Vertex AI credentials).",
    );
  }
}

/**
 * @deprecated Use `initializeGenAIClient`, `getGeminiAPIClient`, or `getVertexAIClient` instead.
 * This function is kept for backward compatibility.
 */
export function getGenAI(config: GenAIConfig = {}): GoogleGenAI {
  if (!genAI) {
    genAI = initializeGenAIClient(config);
  }
  return genAI;
}
