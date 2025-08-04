import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { GenAIConfig } from "../utils/genai";
import { AgentFactory, AgentType } from "../agents/AgentFactory";
import { traceable } from "langsmith/traceable";

// Simple LangGraph-inspired implementation
export class ChatService {
  public processMessage = traceable(
    async (
      message: string,
      history: any[] = [],
      agentType: AgentType = "default",
      config?: GenAIConfig,
      modelName: string = "gemini-2.0-flash",
    ): Promise<string> => {
      console.log("Processing message:", message);
      console.log("History length:", history.length);
      console.log("Agent type:", agentType);
      console.log("Model name:", modelName);

      // Convert history to proper message format
      const initialMessages: BaseMessage[] = history.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Get the agent and delegate message processing
      const agent = AgentFactory.getAgent(agentType);
      return await agent.processMessage(message, initialMessages, config, modelName);
    }, { run_type: "chain", name: "ChatService.processMessage" });
}
