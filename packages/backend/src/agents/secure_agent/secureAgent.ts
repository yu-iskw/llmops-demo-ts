import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { MemorySaver } from "@langchain/langgraph";
import { BaseAgent } from "../baseAgent";
import { SecureAgentState } from "./secureAgentState";
import logger from "@utils/logger";
import { createSecureAgentGraphBuilder } from "./secureAgentBuilder";

export class SecureAgent extends BaseAgent {
  private messageWindowSize: number;
  private compiledGraph: any;

  constructor(messageWindowSize: number = 3, checkpointer?: MemorySaver) {
    super("gemini-2.5-flash", checkpointer);
    this.messageWindowSize = messageWindowSize;
    const genAI = new GoogleGenAI({});
    this.compiledGraph = this.createGraph(genAI);
  }

  getType(): string {
    return "secure";
  }

  getDescription(): string {
    return "An AI assistant with enhanced security features including input and output sanitization.";
  }

  protected createGraph(genAI: GoogleGenAI): any {
    logger.info("Creating SecureAgent graph...");
    const graphBuilder = createSecureAgentGraphBuilder(
      genAI,
      this.defaultModelName,
    );
    return graphBuilder.compile();
  }

  protected createInitialState(
    message: string,
    history: BaseMessage[],
  ): SecureAgentState {
    return {
      user_message: message,
      messages: history,
      sanitized_message: undefined,
      is_suspicious: false,
      suspicious_reason: undefined,
      confidence: undefined,
      ai_response: undefined,
      is_sensitive: false,
      feedback_message: undefined,
      messageWindowSize: this.messageWindowSize,
      next_step: undefined,
    };
  }

  async execute(
    userMessage: string,
    history: BaseMessage[],
  ): Promise<string | null> {
    let currentState: SecureAgentState = this.createInitialState(
      userMessage,
      history,
    );

    try {
      logger.info("Invoking SecureAgent graph...");
      const result = await this.compiledGraph.invoke(currentState);

      if (result.is_suspicious) {
        return "I cannot answer requests that are suspicious or contain potential prompt injections. Please rephrase your request.";
      } else if (result.is_sensitive) {
        // This case should ideally be handled by the graph's internal loop.
        // If it reaches here, it means the graph ended with a sensitive output.
        return "I cannot provide a response as it contains sensitive information even after multiple attempts. Please refine your query.";
      } else if (result.ai_response) {
        return (
          result.ai_response ||
          "I apologize, but I encountered an unexpected error while processing your request."
        );
      } else {
        return "I apologize, but I encountered an unexpected error while processing your request.";
      }
    } catch (error) {
      logger.error("Error during SecureAgent execution:", error);
      return "I apologize, but I encountered an error while trying to answer your request. Please try again.";
    }
  }

  protected extractResponse(streamState: SecureAgentState): string | null {
    return streamState.ai_response || null;
  }
}
