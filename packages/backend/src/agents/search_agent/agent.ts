import { StateGraph, END, START } from "@langchain/langgraph";
import { callModelWithSearch } from "./nodes";
import { SearchAgentStateAnnotation } from "./state";
import { GoogleGenAI, Tool } from "@google/genai"; // Import Tool
// import { getCurrentTimeToolDeclaration } from "../tools/get_current_time"; // Import the tool declaration

export function createSearchAgentGraphBuilder(genAI: GoogleGenAI, modelName: string) {
  const workflow = new StateGraph(SearchAgentStateAnnotation);

  // Add a single node for calling the model with search
  workflow.addNode(
    "call_model_with_search",
    (state) => callModelWithSearch(state, genAI, modelName) // Removed the tool from here
  );

  // The graph is now a straight line from start to end
  workflow
    // @ts-ignore ts(2345)
    .addEdge(START, "call_model_with_search")
    // @ts-ignore ts(2345)
    .addEdge("call_model_with_search", END);

  return workflow;
}
