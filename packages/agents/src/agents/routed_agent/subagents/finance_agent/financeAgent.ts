import { createAgent } from "langchain";

import { createRoutedSpecialistChatModel } from "../common/routedSpecialistChatModel";

/**
 * Personal-finance specialist built with LangChain {@link createAgent}.
 */
export function createFinanceSpecialistAgent(specialistModelName: string) {
  const model = createRoutedSpecialistChatModel(specialistModelName);

  return createAgent({
    model,
    tools: [],
    systemPrompt:
      "You are a specialized personal finance assistant. Help with budgeting, saving, debt basics, investing concepts at a high level, and understanding financial terms. Do not provide individualized investment advice or promises of returns; encourage consulting a licensed professional for complex situations. Be concise.",
    name: "finance_advisor",
  });
}
