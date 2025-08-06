import {
  HumanMessage,
  AIMessage,
  BaseMessage,
  AIMessageChunk,
} from "@langchain/core/messages";
import { GenAIConfig } from "../utils/genai";
import { AgentFactory, AgentType, AgentConfig } from "../agents/agentFactory";
import { traceable } from "langsmith/traceable";
import logger from "../utils/logger";

// Simple LangGraph-inspired implementation
export class ChatService {
  public processMessage = traceable(
    async (
      message: string,
      history: any[] = [],
      agentType: AgentType = "default",
      config?: GenAIConfig,
      modelName: string = "gemini-2.5-flash",
      sessionId?: string,
      agentConfig?: AgentConfig,
    ): Promise<string> => {
      logger.info("Processing message:", message);
      logger.info("History length:", history.length);
      logger.info("Agent type:", agentType);
      logger.info("Model name:", modelName);
      logger.info("Session ID:", sessionId);
      logger.info("Agent config:", agentConfig);

      // Convert history to proper message format
      const initialMessages: BaseMessage[] = history.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Get the agent and delegate message processing
      const agent = AgentFactory.getAgent(agentType, agentConfig);

      // Collect all chunks and return as complete string for backward compatibility
      let fullResponse = "";
      const responseStream = agent.processMessage(
        message,
        initialMessages,
        config,
        modelName,
        sessionId,
      );

      for await (const chunk of responseStream) {
        if (chunk && chunk.content && typeof chunk.content === "string") {
          fullResponse += chunk.content;
        }
      }

      return fullResponse;
    },
    { run_type: "chain", name: "ChatService.processMessage" },
  );

  public processMessageStream = traceable(
    async function* (
      message: string,
      history: any[] = [],
      agentType: AgentType = "default",
      config?: GenAIConfig,
      modelName: string = "gemini-2.5-flash",
      sessionId?: string,
      agentConfig?: AgentConfig,
    ): AsyncGenerator<AIMessageChunk> {
      logger.info("Processing message stream:", message);
      logger.info("History length:", history.length);
      logger.info("Agent type:", agentType);
      logger.info("Model name:", modelName);
      logger.info("Session ID:", sessionId);
      logger.info("Agent config:", agentConfig);

      // Convert history to proper message format
      const initialMessages: BaseMessage[] = history.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Get the agent and delegate message processing
      const agent = AgentFactory.getAgent(agentType, agentConfig);

      // Stream chunks directly from the agent
      const responseStream = agent.processMessage(
        message,
        initialMessages,
        config,
        modelName,
        sessionId,
      );

      for await (const chunk of responseStream) {
        yield chunk;
      }
    },
    { run_type: "chain", name: "ChatService.processMessageStream" },
  );
}
