import { BaseMessage } from "@langchain/core/messages";
import type { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph, MemorySaver } from "@langchain/langgraph";
import { BaseAgent } from "../baseAgent";
import { RoutedAgentState } from "./routedAgentState";
import { createRoutedAgentGraphBuilder } from "./routedAgentBuilder";
import { SpecialistAgentCache } from "./specialistAgentCache";
import { logger } from "@llmops-demo/common";

export class RoutedAgent extends BaseAgent {
  private messageWindowSize: number;
  private readonly specialistAgentCache = new SpecialistAgentCache();

  constructor(messageWindowSize: number = 3, checkpointer?: MemorySaver) {
    super("gemini-2.5-flash", checkpointer);
    this.messageWindowSize = messageWindowSize;
  }

  getType(): string {
    return "routed";
  }

  getDescription(): string {
    return "Routes each request to a trip, finance, or general specialist (LangChain createAgent), then runs a flash-lite output check.";
  }

  protected createGraph(
    genAI: GoogleGenAI,
    modelName: string,
  ): CompiledStateGraph<any, any, any> {
    logger.info("Creating RoutedAgent graph...");
    const graphBuilder = createRoutedAgentGraphBuilder(
      genAI,
      modelName,
      this.specialistAgentCache,
    );
    return graphBuilder.compile();
  }

  protected createInitialState(
    message: string,
    history: BaseMessage[],
  ): RoutedAgentState {
    return {
      user_message: message,
      messages: history,
      ai_response: undefined,
      messageWindowSize: this.messageWindowSize,
      route: undefined,
      is_sensitive: false,
      feedback_message: undefined,
      confidence_probability: undefined,
      suspicious_probability: undefined,
      retry_count: 0,
      max_retries: 3,
    };
  }
}
