import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

export const InputSanitizerStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  // Use MessagesAnnotation for proper message history handling
  ...MessagesAnnotation.spec,
  sanitized_message: Annotation<string | undefined>(),
  isSuspicious: Annotation<boolean>(),
  reason: Annotation<string | undefined>(),
  confidence: Annotation<number | undefined>(),
  messageWindowSize: Annotation<number>(),
});

export type InputSanitizerState = typeof InputSanitizerStateAnnotation.State;
