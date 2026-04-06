import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatVertexAI } from "@langchain/google-vertexai";
import { type GenAIConfig, resolveGenAIAuth } from "../../../../utils/genai";

/**
 * Chat model for LangChain specialist agents (`createAgent`).
 * Auth mode matches {@link resolveGenAIAuth} / {@link initializeGenAIClient}: Vertex when
 * configured, otherwise Gemini Developer API (`GOOGLE_API_KEY`).
 */
export function createRoutedSpecialistChatModel(
  specialistModelName: string,
  config: GenAIConfig = {},
): BaseChatModel {
  const auth = resolveGenAIAuth(config);
  if (auth.mode === "vertex") {
    return new ChatVertexAI({
      model: specialistModelName,
      location: auth.location,
    });
  }
  return new ChatGoogleGenerativeAI({
    model: specialistModelName,
    apiKey: auth.apiKey,
  });
}
