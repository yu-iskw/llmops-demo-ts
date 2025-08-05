import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { BaseAgent } from "../BaseAgent";
import { CreateDefaultAgentGraphBuilder } from "./agent";
import { DefaultAgentState } from "./state";

export class DefaultAgent extends BaseAgent {
  constructor() {
    super("gemini-2.5-flash");
  }

  getType(): string {
    return "default";
  }

  getDescription(): string {
    return "A general-purpose AI assistant.";
  }

  protected createGraph(
    genAI: GoogleGenAI,
    modelName: string,
  ): CompiledStateGraph<any, any, any> {
    return CreateDefaultAgentGraphBuilder(genAI, modelName).compile();
  }

  protected createInitialState(
    message: string,
    history: BaseMessage[],
  ): DefaultAgentState {
    return {
      user_message: message,
      messages: history,
      function_calls: [],
    };
  }

  protected extractResponse(streamState: DefaultAgentState): string | null {
    if (streamState.messages && streamState.messages.length > 0) {
      // Iterate backwards to find the last AI message
      for (let i = streamState.messages.length - 1; i >= 0; i--) {
        const message = streamState.messages[i];
        if (message._getType() === "ai") {
          return message.content as string;
        }
      }
    }
    return null;
  }
}
