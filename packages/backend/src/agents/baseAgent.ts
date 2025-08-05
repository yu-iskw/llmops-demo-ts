import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { GenAIConfig, createGenAIClient } from "../utils/genai";
import { traceable } from "langsmith/traceable";
import logger from "../utils/logger";

// Define the interface inline to avoid file creation issues
export interface IAgent {
  getType(): string;
  getDescription(): string;
  processMessage(
    message: string,
    history: BaseMessage[],
    config?: GenAIConfig,
    modelName?: string,
    sessionId?: string,
  ): Promise<string>;
}

export abstract class BaseAgent implements IAgent {
  protected defaultModelName: string;
  protected checkpointer: MemorySaver; // Declare checkpointer

  constructor(defaultModelName: string = "gemini-2.5-flash") {
    this.defaultModelName = defaultModelName;
    this.checkpointer = new MemorySaver(); // Initialize checkpointer
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
            // Pass sessionId as thread_id for persistence
            configurable: { thread_id: sessionId },
            streamMode: "values",
            // Pass the checkpointer to the stream method
            // @ts-ignore TS2345
            checkpointer: this.checkpointer,
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
