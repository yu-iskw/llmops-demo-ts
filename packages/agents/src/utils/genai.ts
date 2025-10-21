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
 * Initializes and returns a singleton instance of the GoogleGenAI client.
 *
 * This function ensures that only one instance of the GoogleGenAI client is
 * created and used throughout the application, improving efficiency and
 * consistency. It also applies LangSmith tracing to the generateContent method.
 */
export function getGenAI(config: GenAIConfig = {}): GoogleGenAI {
  if (!genAI) {
    logger.info("Initializing GoogleGenAI client...");
    try {
      const finalApiKey = config.apiKey || process.env.GEMINI_API_KEY;
      const finalProject = config.project || process.env.GOOGLE_CLOUD_PROJECT;
      const finalLocation =
        config.location || process.env.GOOGLE_CLOUD_LOCATION;
      const finalUseVertexAI =
        finalApiKey === undefined
          ? config.vertexai
          : process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";

      const useVertexAI = finalUseVertexAI && !!finalProject && !!finalLocation;

      logger.debug("--- getGenAI debug ---");
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
      logger.debug("--- end getGenAI debug ---");

      genAI = new GoogleGenAI({
        apiKey: useVertexAI ? undefined : finalApiKey,
        vertexai: useVertexAI,
        project: finalProject,
        location: finalLocation,
      });

      // Apply traceable wrapper to generateContent
      genAI.models.generateContent = traceable(
        genAI.models.generateContent.bind(genAI.models),
        {
          run_type: "llm",
        },
      );
    } catch (error) {
      logger.error("Failed to initialize GoogleGenAI client:", error);
      throw new Error(
        "GoogleGenAI client initialization failed. Please check your environment variables (e.g., GOOGLE_API_KEY or Vertex AI credentials).",
      );
    }
  }
  return genAI;
}
