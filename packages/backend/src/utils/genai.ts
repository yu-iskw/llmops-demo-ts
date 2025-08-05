import { GoogleGenAI } from "@google/genai";
import { traceable } from "langsmith/traceable";

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
  const finalUseVertexAI = config.vertexai !== undefined
    ? config.vertexai // Use boolean from config if provided
    : (process.env.GOOGLE_GENAI_USE_VERTEXAI === "true"); // Otherwise, parse from env var

  const useVertexAI = finalUseVertexAI && !!finalProject && !!finalLocation;

  console.log("--- createGenAIClient debug ---");
  console.log("config.project:", config.project);
  console.log("config.location:", config.location);
  console.log("process.env.GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT);
  console.log("process.env.GOOGLE_CLOUD_LOCATION:", process.env.GOOGLE_CLOUD_LOCATION);
  console.log("finalProject:", finalProject);
  console.log("finalLocation:", finalLocation);
  console.log("finalUseVertexAI:", finalUseVertexAI);
  console.log("useVertexAI:", useVertexAI);
  console.log("--- end createGenAIClient debug ---");

  const genAI = new GoogleGenAI({
    apiKey: useVertexAI ? undefined : finalApiKey,
    vertexai: useVertexAI,
    project: finalProject,
    location: finalLocation,
  });

  // Wrap the generateContent method for tracing
  genAI.models.generateContent = traceable(genAI.models.generateContent.bind(genAI.models), {
    run_type: "llm",
  });

  return genAI;
}

export let genAI: GoogleGenAI;

export function initializeGenAIClient() {
  genAI = createGenAIClient();
}
