import { BaseMessage, AIMessageChunk } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { GenAIConfig, getGenAI } from "../utils/genai";
import { traceable } from "langsmith/traceable";
import { logger } from "@llmops-demo/common";

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
  ): AsyncGenerator<AIMessageChunk>;
}

export abstract class BaseAgent implements IAgent {
  protected defaultModelName: string;
  protected checkpointer: MemorySaver; // Declare checkpointer

  constructor(
    defaultModelName: string = "gemini-1.5-flash-latest",
    checkpointer?: MemorySaver,
  ) {
    this.defaultModelName = defaultModelName;
    this.checkpointer = checkpointer || new MemorySaver(); // Initialize checkpointer
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
   * Processes a message using the agent's graph
   */
  public async *processMessage(
    message: string,
    history: BaseMessage[],
    config?: GenAIConfig,
    modelName?: string,
    sessionId?: string, // Add sessionId parameter
  ): AsyncGenerator<AIMessageChunk> {
    try {
      const finalModelName = modelName || this.defaultModelName;
      const genAI = getGenAI(config);

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
            streamMode: "messages",
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

      for await (const [token] of stream) {
        logger.debug(`[${this.getType()}] Streaming token:`, token);

        // The token should be an AIMessageChunk
        if (token && typeof token === "object" && "content" in token) {
          yield token as AIMessageChunk;
        }
      }
    } catch (error) {
      logger.error(`[${this.getType()}] Error processing message:`, error);
      // Import AIMessage to create a proper error chunk
      const { AIMessage } = await import("@langchain/core/messages");
      const errorMessage = new AIMessage(
        "Sorry, I encountered an error. Please try again.",
      );
      // Convert to chunk-like structure
      yield errorMessage as unknown as AIMessageChunk;
    }
  }
}
