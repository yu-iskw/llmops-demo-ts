import { HumanMessage, AIMessage } from "@langchain/core/messages";
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
      console.log("Processing message:", message);
      console.log("History length:", history.length);

      const genAI = createGenAIClient(config);
      const compiledGraph = CreateDefaultAgentGraphBuilder(genAI).compile();

      // Convert history to proper message format
      const initialMessages = history.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      let initialState: any = {};
      if (agentType === "default") {
        initialState = {
          user_message: message,
          messages: initialMessages,
        };
      }

      console.log("Initial state:", initialState);

      const stream = await compiledGraph.stream(initialState);
      let finalResponse = "";

      for await (const s of stream) {
        console.log("Stream state:", s);

        // Each 's' in the stream represents the current state of the graph.
        const keys = Object.keys(s);
        if (keys.length === 0) continue;

        const stepResult = (s as any)[keys[0]];
        if (!stepResult || !stepResult.messages || !Array.isArray(stepResult.messages)) continue;

        const lastMessage = stepResult.messages.slice(-1)[0];
        if (lastMessage && lastMessage._getType() === "ai") {
          finalResponse = lastMessage.content;
          console.log("Final response:", finalResponse);
        }
      }

      if (!finalResponse) {
        console.warn("No response generated, returning default message");
        return "I'm sorry, I couldn't generate a response. Please try again.";
      }

      return finalResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}
