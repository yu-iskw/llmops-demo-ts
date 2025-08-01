import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { CreateDefaultAgentGraphBuilder } from "../agents/default_agent/agent";
import { ChatMessage } from "@llmops-demo/common";

// Simple LangGraph-inspired implementation
export class ChatService {
  private compiledGraphs: { [key: string]: any };

  constructor() {
    this.compiledGraphs = {
      default: CreateDefaultAgentGraphBuilder().compile(),
    };
  }

  public async processMessage(
    message: string,
    history: any[] = [],
    agentType: string = "default",
  ): Promise<string> {
    try {
      const compiledGraph = this.compiledGraphs[agentType];
      if (!compiledGraph) {
        return `Error: Agent type \"${agentType}\" not found.`;
      }

      const initialMessages = history.map((msg: any) =>
        msg.role === "human"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      );

      let initialState: any = {};
      if (agentType === "default") {
        initialState = {
          user_message: message,
        };
      }

      const stream = await compiledGraph.stream(initialState);
      let finalResponse = "";
      for await (const s of stream) {
        if (s.call_model && s.call_model.messages && s.call_model.messages.length > 0) {
          const latestMessage = s.call_model.messages[s.call_model.messages.length - 1];
          if (latestMessage._getType() === "ai") {
            finalResponse = latestMessage.content as string;
          }
        }
      }
      return finalResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}
