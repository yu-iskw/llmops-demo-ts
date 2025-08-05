import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

export const SecureAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  // Use MessagesAnnotation for proper message history handling
  ...MessagesAnnotation.spec,
  sanitized_message: Annotation<string | undefined>(),
  is_suspicious: Annotation<boolean>(),
  ai_response: Annotation<string | undefined>(),
  is_sensitive: Annotation<boolean>(),
  feedback_message: Annotation<string | undefined>(),
  messageWindowSize: Annotation<number>(),
  next_step: Annotation<string | undefined>(),
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type SecureAgentState = typeof SecureAgentStateAnnotation.State;
