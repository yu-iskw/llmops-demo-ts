import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { GenAIConfig, createGenAIClient } from "../utils/genai";
import { IAgent } from "./IAgent";
import { traceable } from "langsmith/traceable";

export abstract class BaseAgent implements IAgent {
  protected defaultModelName: string;

  constructor(defaultModelName: string = "gemini-2.0-flash") {
    this.defaultModelName = defaultModelName;
  }

  abstract getType(): string;
  abstract getDescription(): string;

  /**
   * Creates and compiles the agent's graph
   */
  protected abstract createGraph(genAI: GoogleGenAI, modelName: string): CompiledStateGraph<any, any, any>;

  /**
   * Creates the initial state for the agent
   */
  protected abstract createInitialState(message: string, history: BaseMessage[]): any;

  /**
   * Extracts the final response from the stream state
   */
  protected abstract extractResponse(streamState: any): string | null;

  /**
   * Processes a message using the agent's graph
   */
  public async processMessage(
    message: string,
    history: BaseMessage[],
    config?: GenAIConfig,
    modelName?: string,
  ): Promise<string> {
    try {
      const finalModelName = modelName || this.defaultModelName;
      const genAI = createGenAIClient(config);

      const compiledGraph = this.createGraph(genAI, finalModelName);
      const initialState = this.createInitialState(message, history);

      console.log(`[${this.getType()}] Processing message with model:`, finalModelName);
      console.log(`[${this.getType()}] Initial state:`, initialState);

      const stream = await traceable(async () => {
        return compiledGraph.stream(initialState, {
          streamMode: "values",
        });
      }, {
        run_type: "chain",
        name: `${this.getType()} Agent Graph Execution`,
      })();

      let finalResponse = "";

      for await (const streamState of stream) {
        console.log(`[${this.getType()}] Stream state:`, streamState);

        const response = this.extractResponse(streamState);
        if (response) {
          finalResponse = response;
        }
      }

      if (!finalResponse) {
        console.warn(`[${this.getType()}] No response generated, returning default message`);
        return "I'm sorry, I couldn't generate a response. Please try again.";
      }

      console.log(`[${this.getType()}] Final response:`, finalResponse);
      return finalResponse;
    } catch (error) {
      console.error(`[${this.getType()}] Error processing message:`, error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}
