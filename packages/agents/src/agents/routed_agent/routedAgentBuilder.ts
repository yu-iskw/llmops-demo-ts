import { StateGraph, END, START } from "@langchain/langgraph";
import type { GoogleGenAI } from "@google/genai";
import {
  RoutedAgentState,
  RoutedAgentStateAnnotation,
} from "./routedAgentState";
import { SpecialistAgentCache } from "./specialistAgentCache";
import {
  callFinanceSpecialist,
  callGeneralSpecialist,
  callOutputSanitizer,
  callTripSpecialist,
  classifyRoute,
  extractFinalResponse,
} from "./routedAgentNodes";
import { ROUTED_AGENT_SANITIZER_MODEL } from "./routedAgentConstants";
import { logger } from "@llmops-demo/common";

function routeCondition(state: RoutedAgentState): string {
  const r = state.route;
  if (r === "trip" || r === "finance" || r === "general") {
    return r;
  }
  logger.warn("RoutedAgent: missing route, using general");
  return "general";
}

function sanitizationCondition(state: RoutedAgentState): string {
  if (state.is_sensitive && state.retry_count < state.max_retries) {
    const r = state.route || "general";
    logger.warn(
      `RoutedAgent output sensitive (retry_count=${state.retry_count}). Looping back to specialist: ${r}.`,
    );
    return r;
  }
  return "finish";
}

export function createRoutedAgentGraphBuilder(
  genAI: GoogleGenAI,
  specialistModelName: string,
  specialistAgentCache: SpecialistAgentCache,
  sanitizerModelName: string = ROUTED_AGENT_SANITIZER_MODEL,
) {
  const workflow = new StateGraph(RoutedAgentStateAnnotation);

  workflow.addNode("classify_route", (state: RoutedAgentState) =>
    classifyRoute(state, genAI),
  );
  workflow.addNode("trip_specialist", (state: RoutedAgentState) =>
    callTripSpecialist(state, specialistAgentCache, specialistModelName),
  );
  workflow.addNode("finance_specialist", (state: RoutedAgentState) =>
    callFinanceSpecialist(state, specialistAgentCache, specialistModelName),
  );
  workflow.addNode("general_specialist", (state: RoutedAgentState) =>
    callGeneralSpecialist(state, specialistAgentCache, specialistModelName),
  );
  workflow.addNode("output_sanitizer", (state: RoutedAgentState) =>
    callOutputSanitizer(state, genAI, sanitizerModelName),
  );
  workflow.addNode("extract_final_response", (state: RoutedAgentState) =>
    extractFinalResponse(state),
  );

  // @ts-expect-error TS2345: LangGraph START literal typing
  workflow.addEdge(START, "classify_route");

  workflow.addConditionalEdges(
    // @ts-expect-error TS2345: LangGraph node id typing
    "classify_route",
    routeCondition,
    {
      trip: "trip_specialist",
      finance: "finance_specialist",
      general: "general_specialist",
    },
  );

  // @ts-expect-error TS2345: LangGraph node id typing
  workflow.addEdge("trip_specialist", "output_sanitizer");
  // @ts-expect-error TS2345: LangGraph node id typing
  workflow.addEdge("finance_specialist", "output_sanitizer");
  // @ts-expect-error TS2345: LangGraph node id typing
  workflow.addEdge("general_specialist", "output_sanitizer");

  // Conditional edge from output_sanitizer for retry/feedback loop
  workflow.addConditionalEdges(
    // @ts-expect-error TS2345: LangGraph node id typing
    "output_sanitizer",
    sanitizationCondition,
    {
      trip: "trip_specialist",
      finance: "finance_specialist",
      general: "general_specialist",
      finish: "extract_final_response",
    },
  );

  // @ts-expect-error TS2345: LangGraph node id typing
  workflow.addEdge("extract_final_response", END);

  return workflow;
}
