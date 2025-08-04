import { AIMessage } from "@langchain/core/messages";
import { CreateDefaultAgentGraphBuilder } from "../agents/default_agent/agent";
import { GenAIConfig, createGenAIClient } from "../utils/genai";

// Simple LangGraph-inspired implementation
export class ChatService {
  public async processMessage(
    message: string,
    history: any[] = [],
    agentType: string = "default",
    config?: GenAIConfig,
  ): Promise<string> {
    try {
      console.log("config", config);
      const genAI = createGenAIClient(config);
      const compiledGraph =
        CreateDefaultAgentGraphBuilder(genAI).compile();

      const initialMessages = history.map((msg: any) =>
        msg.role === "human"
          ? new AIMessage(msg.content)
          : new AIMessage(msg.content),
      );

      let initialState: any = {};
      if (agentType === "default") {
        initialState = {
          user_message: message,
          messages: initialMessages,
        };
      }

      const stream = await compiledGraph.stream(initialState);
      let finalResponse = "";
      for await (const s of stream) {
        const lastMessage = s[Object.keys(s)[0]].messages.slice(-1)[0];
        if (lastMessage && lastMessage._getType() === "ai") {
          finalResponse = lastMessage.content;
        }
      }
      return finalResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}
