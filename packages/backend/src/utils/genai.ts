import { GoogleGenAI } from "@google/genai";
import { traceable } from "langsmith/traceable";
import logger from "./logger";

export interface GenAIConfig {
  apiKey?: string;
  vertexai?: boolean;
  project?: string;
  location?: string;
}

export function createGenAIClient(config: GenAIConfig = {}): GoogleGenAI {
  const finalApiKey = config.apiKey || process.env.GOOGLE_API_KEY;
  const finalProject = config.project || process.env.GOOGLE_CLOUD_PROJECT;
  const finalLocation = config.location || process.env.GOOGLE_CLOUD_LOCATION;
  const finalUseVertexAI =
    config.vertexai !== undefined
      ? config.vertexai // Use boolean from config if provided
      : process.env.GOOGLE_GENAI_USE_VERTEXAI === "true"; // Otherwise, parse from env var

  const useVertexAI = finalUseVertexAI && !!finalProject && !!finalLocation;

  logger.debug("--- createGenAIClient debug ---");
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
  logger.debug("--- end createGenAIClient debug ---");

  const genAI = new GoogleGenAI({
    apiKey: useVertexAI ? undefined : finalApiKey,
    vertexai: useVertexAI,
    project: finalProject,
    location: finalLocation,
  });

  // Wrap the generateContent method for tracing
  genAI.models.generateContent = traceable(
    genAI.models.generateContent.bind(genAI.models),
    {
      run_type: "llm",
    },
  );

  return genAI;
}

export let genAI: GoogleGenAI;

export function initializeGenAIClient() {
  genAI = createGenAIClient();
}
