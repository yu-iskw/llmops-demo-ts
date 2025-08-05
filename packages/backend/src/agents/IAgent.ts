import { BaseMessage } from "@langchain/core/messages";
import { GenAIConfig } from "../utils/genai";

export interface IAgent {
  /**
   * Processes a user message and returns a response
   * @param message The user's message
   * @param history Array of previous messages in the conversation
   * @param config Optional GenAI configuration
   * @param modelName The model to use for processing
   * @returns Promise resolving to the agent's response
   */
  processMessage(
    message: string,
    history: BaseMessage[],
    config?: GenAIConfig,
    modelName?: string,
    sessionId?: string,
  ): Promise<string>;

  /**
   * Returns the agent's type/name
   */
  getType(): string;

  /**
   * Returns a description of what this agent does
   */
  getDescription(): string;
}
