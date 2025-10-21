import { StateGraph, END, START } from "@langchain/langgraph";
import {
  planQueries,
  executeSearches,
  synthesizeResults,
} from "./researchAgentNodes";
import { SearchAgentStateAnnotation } from "./researchAgentState";
import { GoogleGenAI } from "@google/genai";

export function createSearchAgentGraphBuilder(
  genAI: GoogleGenAI,
  modelName: string,
) {
  const workflow = new StateGraph(SearchAgentStateAnnotation);

  // Add nodes
  workflow.addNode("plan_queries", (state) =>
    planQueries(state, genAI, modelName),
  );
  workflow.addNode("execute_searches", (state) =>
    executeSearches(state, genAI, modelName),
  );
  workflow.addNode("synthesize_results", (state) =>
    synthesizeResults(state, genAI, modelName),
  );

  // Define a router function to decide the next step after planning queries
  const shouldExecuteSearches = (
    state: typeof SearchAgentStateAnnotation.State,
  ) => {
    if (state.search_queries && state.search_queries.length > 0) {
      return "execute_searches";
    }
    return "synthesize_results"; // Skip to synthesis if no queries
  };

  // Define a router function to decide the next step after executing searches
  const shouldSynthesizeResults = (
    state: typeof SearchAgentStateAnnotation.State,
  ) => {
    if (state.search_results && state.search_results.length > 0) {
      return "synthesize_results";
    }
    return "end"; // End if no search results
  };

  // Add edges
  workflow
    // @ts-ignore TS2345
    .addEdge(START, "plan_queries")
    // @ts-ignore TS2345
    .addConditionalEdges("plan_queries", shouldExecuteSearches, {
      execute_searches: "execute_searches",
      synthesize_results: "synthesize_results",
    })
    // @ts-ignore TS2345
    .addConditionalEdges("execute_searches", shouldSynthesizeResults, {
      synthesize_results: "synthesize_results",
      end: END,
    })
    // @ts-ignore TS2345
    .addEdge("synthesize_results", END);

  return workflow;
}
