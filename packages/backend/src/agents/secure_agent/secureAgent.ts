import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { GoogleGenAI } from "@google/genai";
import { BaseAgent } from "../baseAgent";
import { SecureAgentState } from "./secureAgentState";
import logger from "@utils/logger";
import { extractStringContent } from "@utils/agentUtils";
import { checkInput } from "./subagents/input_sanitizer/inputSanitizerNodes";
import { answerRequest } from "./subagents/request_answerer/requestAnswererNodes";
import { checkOutput } from "./subagents/output_sanitizer/outputSanitizerNodes";

export class SecureAgent extends BaseAgent {
  private messageWindowSize: number;

  constructor(messageWindowSize: number = 3) {
    super("gemini-2.5-flash");
    this.messageWindowSize = messageWindowSize;
  }

  getType(): string {
    return "secure";
  }

  getDescription(): string {
    return "An AI assistant with enhanced security features including input and output sanitization.";
  }

  protected createGraph(genAI: GoogleGenAI): any {
    // This agent no longer uses a CompiledStateGraph directly.
    // The orchestration is handled within the execute method.
    return null;
  }

  protected createInitialState(
    message: string,
    history: BaseMessage[],
  ): SecureAgentState {
    return {
      user_message: message,
      messages: history,
      sanitized_message: extractStringContent(history.length > 0 ? history[history.length - 1].content : undefined),
      is_suspicious: false,
      ai_response: undefined,
      is_sensitive: false,
      feedback_message: undefined,
      messageWindowSize: this.messageWindowSize,
      next_step: undefined,
    };
  }

  async execute(
    userMessage: string,
    history: BaseMessage[],
  ): Promise<string | null> {
    let currentState: SecureAgentState = this.createInitialState(
      userMessage,
      history,
    );

    const genAI = new GoogleGenAI({}); // Initialize GenAI here or pass from higher level

    // --- Sub Graph 1: Check and sanitize the user's input ---
    logger.info("Executing Input Sanitizer");
    const inputSanitizerResult = await checkInput(
      { ...currentState, user_message: userMessage },
      genAI,
      this.defaultModelName,
    );
    currentState = { ...currentState, ...inputSanitizerResult };

    if (currentState.is_suspicious) {
      return "I cannot answer requests that are suspicious or contain potential prompt injections. Please rephrase your request.";
    }

    let maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      // --- Sub Graph 2: Answer the user's request ---
      logger.info("Executing Request Answerer");
      const requestAnswererResult = await answerRequest(
        { ...currentState, user_message: currentState.sanitized_message || userMessage },
        genAI,
        this.defaultModelName,
      );
      currentState = { ...currentState, ...requestAnswererResult };

      // If no AI response, something went wrong in answering, break loop
      if (!currentState.ai_response) {
        logger.error("Request Answerer failed to generate a response.");
        return "I apologize, but I encountered an error while trying to answer your request. Please try again.";
      }

      // --- Sub Graph 3: Check if the answer contains sensitive information ---
      logger.info("Executing Output Sanitizer");
      const outputSanitizerResult = await checkOutput(
        { ...currentState, ai_response: currentState.ai_response },
        genAI,
        this.defaultModelName,
      );
      currentState = { ...currentState, ...outputSanitizerResult };

      if (currentState.is_sensitive) {
        logger.warn("Output detected as sensitive. Re-answering with feedback.");
        // Feedback loop: go back to request answerer with feedback
        currentState.feedback_message = currentState.feedback_message || "The previous answer contained sensitive information. Please refine.";
        retries++;
      } else {
        // Output is safe, break loop and return response
        return currentState.ai_response || null;
      }
    }

    // If max retries reached and still sensitive
    if (currentState.is_sensitive) {
      return "I cannot provide a response as it contains sensitive information even after multiple attempts. Please refine your query.";
    }

    return null; // Should not reach here in normal flow
  }

  protected extractResponse(streamState: SecureAgentState): string | null {
    // This method is no longer directly used for streaming responses in this non-LangGraph setup.
    // The execute method returns the final string response directly.
    // However, it can be used for final state interpretation if needed.
    return streamState.ai_response || null;
  }
}
