import { StateGraph, END, START } from "@langchain/langgraph";
import {
  SecureAgentStateAnnotation,
  SecureAgentState,
} from "./secureAgentState";
import { GoogleGenAI } from "@google/genai";
import {
  callInputSanitizer,
  callRequestAnswerer,
  callOutputSanitizer,
  extractFinalResponse,
} from "./secureAgentNodes";
import logger from "../../utils/logger";

export function createSecureAgentGraphBuilder(
  genAI: GoogleGenAI,
  modelName: string,
) {
  const workflow = new StateGraph(SecureAgentStateAnnotation);

  workflow.addNode("input_sanitizer", (state: SecureAgentState) =>
    callInputSanitizer(state, genAI, modelName),
  );
  workflow.addNode("request_answerer", (state: SecureAgentState) =>
    callRequestAnswerer(state, genAI, modelName),
  );
  workflow.addNode("output_sanitizer", (state: SecureAgentState) =>
    callOutputSanitizer(state, genAI, modelName),
  );
  workflow.addNode("extract_final_response", (state: SecureAgentState) =>
    extractFinalResponse(state),
  );

  // @ts-expect-error TS2345: LangGraph type definition issue - string literal not assignable to '__start__'.
  workflow.addEdge(START, "input_sanitizer");

  // Conditional edge from input_sanitizer
  workflow.addConditionalEdges(
    // @ts-expect-error TS2345: LangGraph type definition issue - string literal not assignable to '__start__'.
    "input_sanitizer",
    (state: SecureAgentState) => {
      if (state.is_suspicious) {
        logger.info("Input is suspicious. Ending flow.");
        return "end_suspicious";
      }
      logger.info("Input is safe. Proceeding to answer request.");
      return "continue_to_answer";
    },
    {
      continue_to_answer: "request_answerer",
      end_suspicious: END, // End the graph if input is suspicious
    },
  );

  // Conditional edge from output_sanitizer
  workflow.addConditionalEdges(
    // @ts-expect-error TS2345: LangGraph type definition issue - string literal not assignable to '__start__'.
    "output_sanitizer",
    (state: SecureAgentState) => {
      if (state.is_sensitive) {
        logger.warn(
          "Output is sensitive. Looping back to request_answerer for refinement.",
        );
        return "refine_answer";
      }
      logger.info("Output is safe. Ending flow.");
      return "end_safe";
    },
    {
      refine_answer: "request_answerer", // Loop back for refinement
      end_safe: "extract_final_response", // Transition to the new node if output is safe
    },
  );

  // Direct edge from request_answerer to output_sanitizer
  // @ts-expect-error TS2345: LangGraph type definition issue - string literal not assignable to '__start__'.
  workflow.addEdge("request_answerer", "output_sanitizer");

  // Direct edge from extract_final_response to END
  // @ts-expect-error TS2345: LangGraph type definition issue - string literal not assignable to '__start__'.
  workflow.addEdge("extract_final_response", END);

  return workflow;
}
