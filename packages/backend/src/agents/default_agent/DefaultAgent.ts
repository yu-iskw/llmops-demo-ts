import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { BaseAgent } from "../BaseAgent";
import { CreateDefaultAgentGraphBuilder } from "./agent";
import { DefaultAgentState } from "./state";

export class DefaultAgent extends BaseAgent {
  constructor() {
    super("gemini-2.0-flash");
  }

  getType(): string {
    return "default";
  }

  getDescription(): string {
    return "A general-purpose AI assistant.";
  }

  protected createGraph(genAI: GoogleGenAI, modelName: string): CompiledStateGraph<any, any, any> {
    return CreateDefaultAgentGraphBuilder(genAI, modelName).compile();
  }

  protected createInitialState(message: string, history: BaseMessage[]): DefaultAgentState {
    return {
      user_message: message,
      messages: history,
    };
  }

  protected extractResponse(streamState: DefaultAgentState): string | null {
    if (streamState.messages && streamState.messages.length > 0) {
      const lastMessage = streamState.messages.slice(-1)[0];
      if (lastMessage._getType() === "ai") {
        return lastMessage.content as string;
      }
    }
    return null;
  }
}
