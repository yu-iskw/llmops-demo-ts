import { randomUUID } from "node:crypto";
import { MemorySaver } from "@langchain/langgraph";
import { createRoutedAgentGraphBuilder } from "../../../../routedAgentBuilder";
import { SpecialistAgentCache } from "../../../../specialistAgentCache";
import { getGenAI } from "../../../../../../utils/genai";
import { RoutedE2EInputs, RoutedE2EOutputs } from "./types";

const modelName = "gemini-2.5-flash";
const specialistCache = new SpecialistAgentCache();

let routedAgentGraph:
  | ReturnType<ReturnType<typeof createRoutedAgentGraphBuilder>["compile"]>
  | undefined;

function getRoutedAgentGraph(): NonNullable<typeof routedAgentGraph> {
  if (routedAgentGraph != null) {
    return routedAgentGraph;
  }
  const genAI = getGenAI();
  routedAgentGraph = createRoutedAgentGraphBuilder(
    genAI,
    modelName,
    specialistCache,
  ).compile({
    checkpointer: new MemorySaver(),
  });
  return routedAgentGraph;
}

export async function targetFunction(
  inputs: RoutedE2EInputs,
): Promise<RoutedE2EOutputs> {
  try {
    const routedAgentGraphInstance = getRoutedAgentGraph();
    const initialState = {
      user_message: inputs.user_message,
      messages: inputs.messages,
      messageWindowSize: inputs.messageWindowSize,
      ai_response: undefined,
      route: undefined,
      is_sensitive: false,
      feedback_message: undefined,
      confidence_probability: undefined,
      suspicious_probability: undefined,
    };

    const result = await routedAgentGraphInstance.invoke(initialState, {
      configurable: { thread_id: randomUUID() },
    });

    return {
      route: result.route ?? "general",
      ai_response: result.ai_response ?? "",
      is_sensitive: Boolean(result.is_sensitive),
      confidence_probability: result.confidence_probability,
      suspicious_probability: result.suspicious_probability,
    };
  } catch (error) {
    console.error("Error in routed agent E2E target function:", error);
    return {
      route: "general",
      ai_response: "An error occurred during routed agent evaluation.",
      is_sensitive: false,
      confidence_probability: undefined,
      suspicious_probability: undefined,
    };
  }
}
