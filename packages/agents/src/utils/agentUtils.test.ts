import { createHistoryContent, createConversationContents } from "./agentUtils";
import {
  HumanMessage,
  AIMessage,
  FunctionMessage,
} from "@langchain/core/messages";

describe("agentUtils", () => {
  describe("createHistoryContent", () => {
    it("should convert LangChain messages to Google GenAI Content format", () => {
      const messages = [
        new HumanMessage("Hello"),
        new AIMessage("Hi there!"),
        new HumanMessage("How are you?"),
        new AIMessage("I'm doing well, thank you!"),
      ];

      const result = createHistoryContent(messages, 3);

      expect(result).toHaveLength(3); // Only last 3 messages
      expect(result[0]).toEqual({
        role: "model",
        parts: [{ text: "Hi there!" }],
      });
      expect(result[1]).toEqual({
        role: "user",
        parts: [{ text: "How are you?" }],
      });
      expect(result[2]).toEqual({
        role: "model",
        parts: [{ text: "I'm doing well, thank you!" }],
      });
    });

    it("should filter out function messages", () => {
      const messages = [
        new HumanMessage("Hello"),
        new AIMessage("Hi there!"),
        new FunctionMessage({ content: "function result", name: "test" }),
        new HumanMessage("How are you?"),
      ];

      const result = createHistoryContent(messages, 4);

      expect(result).toHaveLength(3); // Function message should be filtered out
      expect(result[0]).toEqual({
        role: "user",
        parts: [{ text: "Hello" }],
      });
      expect(result[1]).toEqual({
        role: "model",
        parts: [{ text: "Hi there!" }],
      });
      expect(result[2]).toEqual({
        role: "user",
        parts: [{ text: "How are you?" }],
      });
    });

    it("should respect message window size", () => {
      const messages = [
        new HumanMessage("Message 1"),
        new AIMessage("Response 1"),
        new HumanMessage("Message 2"),
        new AIMessage("Response 2"),
        new HumanMessage("Message 3"),
      ];

      const result = createHistoryContent(messages, 2);

      expect(result).toHaveLength(2); // Only last 2 messages
      expect(result[0]).toEqual({
        role: "model",
        parts: [{ text: "Response 2" }],
      });
      expect(result[1]).toEqual({
        role: "user",
        parts: [{ text: "Message 3" }],
      });
    });
  });

  describe("createConversationContents", () => {
    it("should create complete conversation contents with user message", () => {
      const messages = [new HumanMessage("Hello"), new AIMessage("Hi there!")];

      const userMessage = "What's the weather like?";
      const result = createConversationContents(messages, userMessage, 2);

      expect(result).toHaveLength(3); // History + current user message
      expect(result[0]).toEqual({
        role: "user",
        parts: [{ text: "Hello" }],
      });
      expect(result[1]).toEqual({
        role: "model",
        parts: [{ text: "Hi there!" }],
      });
      expect(result[2]).toEqual({
        role: "user",
        parts: [{ text: "What's the weather like?" }],
      });
    });

    it("should handle empty message history", () => {
      const messages: any[] = [];
      const userMessage = "Hello";
      const result = createConversationContents(messages, userMessage, 3);

      expect(result).toHaveLength(1); // Only current user message
      expect(result[0]).toEqual({
        role: "user",
        parts: [{ text: "Hello" }],
      });
    });
  });
});
