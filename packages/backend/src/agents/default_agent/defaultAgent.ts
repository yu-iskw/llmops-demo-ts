import { BaseMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { CompiledStateGraph } from "@langchain/langgraph";
import { BaseAgent } from "../baseAgent";
import { CreateDefaultAgentGraphBuilder } from "./defaultAgentBuilder";
import { DefaultAgentState } from "./defaultAgentState";

export class DefaultAgent extends BaseAgent {
  private messageWindowSize: number;

  constructor(messageWindowSize: number = 3) {
    super("gemini-2.5-flash");
    this.messageWindowSize = messageWindowSize;
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
      messageWindowSize: this.messageWindowSize,
    };
  }
}
