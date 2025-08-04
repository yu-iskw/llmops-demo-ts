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

  const genAI = new GoogleGenAI({
    apiKey: useVertexAI ? undefined : finalApiKey,
    vertexai: useVertexAI,
    project: finalProject,
    location: finalLocation,
  });

  console.log("LangSmith Tracing Enabled:", process.env.LANGSMITH_TRACING);
  console.log("LangSmith API Key Set:", !!process.env.LANGSMITH_API_KEY);
  console.log("LangSmith Project:", process.env.LANGSMITH_PROJECT);
  console.log("LangChain Callbacks Background:", process.env.LANGCHAIN_CALLBACKS_BACKGROUND);

  // Wrap the generateContent method for tracing
  genAI.models.generateContent = traceable(genAI.models.generateContent.bind(genAI.models), {
    run_type: "llm",
  });

  return genAI;
}

export const genAI = createGenAIClient();
