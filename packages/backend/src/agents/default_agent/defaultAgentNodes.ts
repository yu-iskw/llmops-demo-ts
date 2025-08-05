import {
  AIMessage,
  FunctionMessage,
  BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { DefaultAgentStateAnnotation } from "./defaultAgentState";
import {
  GoogleGenAI,
  FunctionCall,
  FunctionCallingConfigMode,
  Content,
} from "@google/genai";
import {
  getCurrentTimeToolDeclaration,
  executeToolCalls,
} from "../tools/getCurrentTime";
import logger from "../../utils/logger";

// Define the function that calls the model
export const callModel = async (
  state: typeof DefaultAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const allMessages = state.messages || [];
    const messageWindowSize = state.messageWindowSize || 3;

    // Get only the last N messages based on messageWindowSize
    const recentMessages = allMessages.slice(-messageWindowSize);

    // Convert history messages to Google GenAI format
    // Filter out function messages to avoid API confusion
    const historyContent: Content[] = recentMessages
      .filter((msg) => msg.getType() !== "function") // Skip function messages in history
      .map((msg): Content | undefined => {
        if (msg.getType() === "human") {
          return { role: "user", parts: [{ text: msg.content as string }] };
        } else if (msg.getType() === "ai") {
          return { role: "model", parts: [{ text: msg.content as string }] };
        }
        return undefined;
      })
      .filter((item): item is Content => item !== undefined);

    // Build the conversation with user message
    const contents: Content[] = [
      // Conversation history
      ...historyContent,
      // Current user message
      { role: "user", parts: [{ text: state.user_message }] },
    ];

    logger.info(`Processing with message window size: ${messageWindowSize}, using ${recentMessages.length} recent messages`);

    // Generate content with system instruction only (function calling disabled for now)
    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        tools: [{ functionDeclarations: [getCurrentTimeToolDeclaration] }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          }
        },
        systemInstruction: "You are a helpful AI assistant. You are knowledgeable, friendly, and always try to provide accurate and useful information. When users ask questions, respond in a clear, helpful manner.",
      },
    });

    logger.info("Model response received");
    logger.info("Function calls:", result.functionCalls);

    // Always handle as text response (function calling disabled)
    const aiMessage = new AIMessage(result.text || "");
    logger.info("Model returned text response:", result.text);

    // Add both user message and AI response to message history
    return {
      messages: [
        new HumanMessage(state.user_message),
        aiMessage,
      ],
    };
  } catch (error) {
    logger.error("Error calling model:", error);

    // Provide a more helpful error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const aiMessage = new AIMessage(
      `I apologize, but I encountered an error while processing your request: ${errorMessage}. Please try again or rephrase your question.`
    );

    return {
      messages: [
        new HumanMessage(state.user_message),
        aiMessage,
      ],
    };
  }
};

export const callTool = async (
  state: typeof DefaultAgentStateAnnotation.State,
) => {
  try {
    const toolCalls = state.function_calls || [];

    if (toolCalls.length === 0) {
      logger.warn("No tool calls to execute");
      return {
        messages: [],
      };
    }

    logger.info(`Executing ${toolCalls.length} tool calls`);
    const toolOutputs = executeToolCalls(toolCalls);

    logger.info("Tool execution completed successfully");
    return {
      messages: toolOutputs,
      function_calls: [], // Clear function calls after execution to prevent infinite loop
    };
  } catch (error) {
    logger.error("Error executing tools:", error);

    // Create error messages for failed tool executions
    const errorMessages = state.function_calls?.map(toolCall =>
      new FunctionMessage({
        content: `Error executing tool ${toolCall.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
        name: toolCall.name || "unknown",
      })
    ) || [];

    return {
      messages: errorMessages,
      function_calls: [], // Clear function calls even on error to prevent infinite loop
    };
  }
};
