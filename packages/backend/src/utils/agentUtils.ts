import { BaseMessage } from "@langchain/core/messages";
import { Content } from "@google/genai";

/**
 * Converts a list of LangChain messages to Google GenAI Content format
 * for use in conversation history.
 *
 * @param messages - Array of LangChain messages to convert
 * @param messageWindowSize - Maximum number of recent messages to include (default: 3)
 * @returns Array of Google GenAI Content objects representing the conversation history
 */
export function createHistoryContent(
  messages: BaseMessage[],
  messageWindowSize: number = 3,
): Content[] {
  // Get only the last N messages based on messageWindowSize
  const recentMessages = messages.slice(-messageWindowSize);

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

  return historyContent;
}

/**
 * Creates the complete conversation contents array for Google GenAI,
 * including history and current user message.
 *
 * @param messages - Array of LangChain messages representing conversation history
 * @param userMessage - Current user message to add to the conversation
 * @param messageWindowSize - Maximum number of recent messages to include (default: 3)
 * @returns Array of Google GenAI Content objects for the complete conversation
 */
export function createConversationContents(
  messages: BaseMessage[],
  userMessage: string,
  messageWindowSize: number = 3,
): Content[] {
  const historyContent = createHistoryContent(messages, messageWindowSize);

  // Build the conversation with user message
  const contents: Content[] = [
    // Conversation history
    ...historyContent,
    // Current user message
    { role: "user", parts: [{ text: userMessage }] },
  ];

  return contents;
}
