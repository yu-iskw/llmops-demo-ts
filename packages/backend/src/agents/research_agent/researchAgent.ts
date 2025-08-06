import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { BaseAgent } from "../baseAgent";
import { createSearchAgentGraphBuilder } from "./researchAgentBuilder";
import { SearchAgentState } from "./researchAgentState";

export class ResearchAgent extends BaseAgent {
  constructor() {
    super("gemini-2.5-flash");
  }

  getType(): string {
    return "research";
  }

  getDescription(): string {
    return "An AI assistant specializing in research and information gathering.";
  }

  protected createGraph(
    genAI: GoogleGenAI,
    modelName: string,
  ): CompiledStateGraph<any, any, any> {
    return createSearchAgentGraphBuilder(genAI, modelName).compile();
  }

  protected createInitialState(
    message: string,
    history: BaseMessage[],
  ): SearchAgentState {
    return {
      user_message: message,
      response: null,
      search_queries: [],
      search_results: [],
      messages: history,
      function_calls: [],
    };
  }
}
