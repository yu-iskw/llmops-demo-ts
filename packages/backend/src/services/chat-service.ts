import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { CreateDefaultAgentGraphBuilder } from "../agents/default_agent/agent";
import { createSearchAgentGraphBuilder } from "../agents/search_agent/agent"; // Import search agent builder
import { GenAIConfig, createGenAIClient } from "../utils/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { SearchAgentState } from "../agents/search_agent/state"; // Import search agent state
import { DefaultAgentState } from "../agents/default_agent/state";

type StreamState = SearchAgentState | DefaultAgentState; // Update StreamState

// Simple LangGraph-inspired implementation
export class ChatService {
  public async processMessage(
    message: string,
    history: any[] = [],
    agentType: string = "default",
    config?: GenAIConfig,
    modelName: string = "gemini-2.0-flash" // Add modelName parameter with default
  ): Promise<string> {
    try {
      console.log("Processing message:", message);
      console.log("History length:", history.length);
      console.log("Agent type:", agentType);
      console.log("Model name:", modelName);

      const genAI = createGenAIClient(config);
      let compiledGraph: CompiledStateGraph<any, any>;

      if (agentType === "search") {
        compiledGraph = createSearchAgentGraphBuilder(genAI, modelName).compile(); // Pass modelName
      } else {
        compiledGraph = CreateDefaultAgentGraphBuilder(genAI, modelName).compile(); // Pass modelName
      }

      // Convert history to proper message format
      const initialMessages: BaseMessage[] = history.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      let initialState: any = {};
      if (agentType === "search") {
        initialState = {
          user_message: message,
          messages: initialMessages,
        } as SearchAgentState; // Cast to SearchAgentState
      } else {
        initialState = {
          user_message: message,
          messages: initialMessages,
        };
      }

      console.log("Initial state:", initialState);

      const stream = await compiledGraph.stream(initialState, {
        streamMode: "values",
      });
      let finalResponse = "";

      for await (const s of stream as AsyncIterable<StreamState>) {
        console.log("Stream state:", s);

        if ("report" in s && s.report) {
          finalResponse = s.report;
          console.log("Final report:", finalResponse);
        } else if ("messages" in s && s.messages.length > 0) {
          const lastMessage = s.messages.slice(-1)[0];
          if (lastMessage._getType() === "ai") {
            finalResponse = lastMessage.content as string;
            console.log("Final response:", finalResponse);
          }
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
