import { Type, FunctionCall } from "@google/genai";
import { FunctionMessage } from "@langchain/core/messages";
import logger from "../../utils/logger";

/**
 * Get the current timestamp in ISO format.
 * This function always returns the current time when called.
 * @returns Current timestamp in ISO 8601 format (e.g., "2024-02-26T16:27:15.563Z")
 */
export const getCurrentTime = (): string => {
  return new Date().toISOString();
};

/**
 * Get the current timestamp in milliseconds since Unix Epoch.
 * @returns Current timestamp in milliseconds
 */
export const getCurrentTimeMs = (): number => {
  return Date.now();
};

/**
 * Get the current timestamp in seconds since Unix Epoch.
 * @returns Current timestamp in seconds
 */
export const getCurrentTimeSeconds = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Get the current timestamp in a human-readable format.
 * @returns Current timestamp in a readable format (e.g., "2024-02-26 18:28:11")
 */
export const getCurrentTimeReadable = (): string => {
  const now = new Date();
  return now.toLocaleString();
};

export const getCurrentTimeToolDeclaration = {
  name: "getCurrentTime",
  description:
    "Get the current timestamp in ISO format. Use this function only when you need the exact current time to answer the user's request.",
  parametersJsonSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

/**
 * Execute the getCurrentTime tool based on the function call.
 * @param toolCall The function call object containing tool name and arguments
 * @returns FunctionMessage with the tool execution result
 */
export const executeGetCurrentTimeTool = (
  toolCall: FunctionCall,
): FunctionMessage => {
  const toolName = toolCall.name || "unknown";

  if (toolName === getCurrentTimeToolDeclaration.name) {
    logger.info(`Calling tool: ${toolName} with args:`, toolCall.args);
    const output = getCurrentTime();
    return new FunctionMessage({
      content: output,
      name: toolName,
    });
  } else {
    logger.warn(`Tool not found: ${toolName}`);
    return new FunctionMessage({
      content: `Tool not found: ${toolName}`,
      name: toolName,
    });
  }
};

/**
 * Execute multiple tool calls and return the results.
 * @param toolCalls Array of function call objects
 * @returns Array of FunctionMessage objects with tool execution results
 */
export const executeToolCalls = (
  toolCalls: FunctionCall[],
): FunctionMessage[] => {
  return toolCalls.map((toolCall) => executeGetCurrentTimeTool(toolCall));
};

/**
 * Test function to verify the tool is working correctly.
 * @returns Current timestamp for testing purposes
 */
export const testGetCurrentTime = (): string => {
  const result = getCurrentTime();
  logger.info(`Test getCurrentTime result: ${result}`);
  return result;
};
