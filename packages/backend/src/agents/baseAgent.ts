import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { GenAIConfig, createGenAIClient } from "../utils/genai";
import { IAgent } from "./iAgent";
import { traceable } from "langsmith/traceable";
import logger from "../utils/logger";

export abstract class BaseAgent implements IAgent {
  protected defaultModelName: string;

  constructor(defaultModelName: string = "gemini-2.5-flash") {
    this.defaultModelName = defaultModelName;
  }

  abstract getType(): string;
  abstract getDescription(): string;

  /**
   * Creates and compiles the agent's graph
   */
  protected abstract createGraph(
    genAI: GoogleGenAI,
    modelName: string,
  ): CompiledStateGraph<any, any, any>;

  /**
   * Creates the initial state for the agent
   */
  protected abstract createInitialState(
    message: string,
    history: BaseMessage[],
  ): any;

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
    sessionId?: string, // Add sessionId parameter
  ): Promise<string> {
    try {
      const finalModelName = modelName || this.defaultModelName;
      const genAI = createGenAIClient(config);

      const compiledGraph = this.createGraph(genAI, finalModelName);
      const initialState = this.createInitialState(message, history);

      logger.info(
        `[${this.getType()}] Processing message with model:`,
        finalModelName,
      );
      logger.info(`[${this.getType()}] Initial state:`, initialState);

      const stream = await traceable(
        async () => {
          return compiledGraph.stream(initialState, {
            streamMode: "values",
          });
        },
        {
          run_type: "chain",
          name: `${this.getType()} Agent Graph Execution`,
          metadata: { sessionId }, // Pass sessionId as metadata
        },
      )();

      let finalResponse = "";

      for await (const streamState of stream) {
        logger.info(`[${this.getType()}] Stream state:`, streamState);

        const response = this.extractResponse(streamState);
        if (response) {
          finalResponse = response;
        }
      }

      if (!finalResponse) {
        logger.warn(
          `[${this.getType()}] No response generated, returning default message`,
        );
        return "I'm sorry, I couldn't generate a response. Please try again.";
      }

      logger.info(`[${this.getType()}] Final response:`, finalResponse);
      return finalResponse;
    } catch (error) {
      logger.error(`[${this.getType()}] Error processing message:`, error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}
