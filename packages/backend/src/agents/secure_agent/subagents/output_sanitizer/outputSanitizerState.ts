import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

export interface OutputSanitizerOutput {
  isSensitive: boolean;
  reason: string;
}

export const OutputSanitizerStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  messages: MessagesAnnotation.spec.messages,
  is_sensitive: Annotation<boolean>(),
  feedback_message: Annotation<string | undefined>(),
  messageWindowSize: Annotation<number>(),
});

export type OutputSanitizerState = typeof OutputSanitizerStateAnnotation.State;
