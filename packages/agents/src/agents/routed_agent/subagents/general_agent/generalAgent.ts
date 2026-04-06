import { createAgent } from "langchain";

import { createRoutedSpecialistChatModel } from "../common/routedSpecialistChatModel";

/**
 * General assistant for queries that are neither clearly travel nor finance.
 */
export function createGeneralSpecialistAgent(specialistModelName: string) {
  const model = createRoutedSpecialistChatModel(specialistModelName);

  return createAgent({
    model,
    tools: [],
    systemPrompt:
      "You are a helpful general assistant. Answer clearly and concisely. If a question clearly needs domain expertise you do not have, say so briefly.",
    name: "general_assistant",
  });
}
