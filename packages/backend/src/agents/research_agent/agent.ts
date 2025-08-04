import { StateGraph, END, START } from "@langchain/langgraph";
import { planQueries, executeSearches, synthesizeResults } from "./nodes";
import { SearchAgentStateAnnotation } from "./state";
import { GoogleGenAI, Tool } from "@google/genai";

export function createSearchAgentGraphBuilder(genAI: GoogleGenAI, modelName: string) {
  const workflow = new StateGraph(SearchAgentStateAnnotation);

  // Add nodes
  workflow.addNode("plan_queries", (state) => planQueries(state, genAI, modelName));
  workflow.addNode("execute_searches", (state) => executeSearches(state, genAI, modelName));
  workflow.addNode("synthesize_results", (state) => synthesizeResults(state, genAI, modelName));

  // Define the graph flow
  workflow
    // @ts-ignore TS2345
    .addEdge(START, "plan_queries")
    // @ts-ignore TS2345
    .addEdge("plan_queries", "execute_searches")
    // @ts-ignore TS2345
    .addEdge("execute_searches", "synthesize_results")
    // @ts-ignore TS2345
    .addEdge("synthesize_results", END);

  return workflow;
}
