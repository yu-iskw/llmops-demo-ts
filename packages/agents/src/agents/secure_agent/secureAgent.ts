import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { MemorySaver } from "@langchain/langgraph";
import { BaseAgent } from "../baseAgent";
import { SecureAgentState } from "./secureAgentState";
import { logger } from "@llmops-demo/common";
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
}
