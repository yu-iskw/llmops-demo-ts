import { createAgent } from "langchain";

import { createRoutedSpecialistChatModel } from "../common/routedSpecialistChatModel";

/**
 * Trip-planning specialist built with LangChain {@link createAgent} (ReAct runtime).
 */
export function createTripSpecialistAgent(specialistModelName: string) {
  const model = createRoutedSpecialistChatModel(specialistModelName);

  return createAgent({
    model,
    tools: [],
    systemPrompt:
      "You are a specialized travel and trip planning assistant. Help with itineraries, destinations, transportation, accommodation, travel budgets, and sightseeing. Be practical and concise. If the user asks about topics outside travel, briefly say your focus is travel and offer only generic safe guidance.",
    name: "trip_planner",
  });
}
