import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
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
      return await agent.processMessage(
        message,
        initialMessages,
        config,
        modelName,
        sessionId,
      );
    },
    { run_type: "chain", name: "ChatService.processMessage" },
  );
}
