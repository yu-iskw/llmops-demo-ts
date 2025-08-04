import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { CreateDefaultAgentGraphBuilder } from "../agents/default_agent/agent";
import { createSearchAgentGraphBuilder as createResearchAgentGraphBuilder } from "../agents/research_agent/agent"; // Import research agent builder
import { GenAIConfig, createGenAIClient } from "../utils/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { SearchAgentState as ResearchAgentState } from "../agents/research_agent/state"; // Import research agent state
import { DefaultAgentState } from "../agents/default_agent/state";

type StreamState = ResearchAgentState | DefaultAgentState; // Update StreamState

// Define a map to hold agent builders
const agentBuilders = {
  default: CreateDefaultAgentGraphBuilder,
  research: createResearchAgentGraphBuilder,
};

// Simple LangGraph-inspired implementation
export class ChatService {
  public async processMessage(
    message: string,
    history: any[] = [],
    agentType: keyof typeof agentBuilders = "default", // Use keyof typeof agentBuilders
    config?: GenAIConfig,
    modelName: string = "gemini-2.0-flash", // Default model set here
  ): Promise<string> {
    try {
      console.log("Processing message:", message);
      console.log("History length:", history.length);
      console.log("Agent type:", agentType);
      console.log("Model name:", modelName);

      const genAI = createGenAIClient(config);

      // Get the appropriate agent builder from the map
      const agentBuilder = agentBuilders[agentType];
      if (!agentBuilder) {
        throw new Error(`Unknown agent type: ${agentType}`);
      }

      const compiledGraph = agentBuilder(genAI, modelName).compile();

      // Convert history to proper message format
      const initialMessages: BaseMessage[] = history.map((msg: any) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      const initialState: StreamState = {
        user_message: message,
        messages: initialMessages,
      };

      console.log("Initial state:", initialState);

      const stream = await compiledGraph.stream(initialState, {
        streamMode: "values",
      });
      let finalResponse = "";

      for await (const s of stream as AsyncIterable<StreamState>) {
        console.log("Stream state:", s);

        if (
          "report" in s &&
          s.report !== null &&
          typeof s.report === "string"
        ) {
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
