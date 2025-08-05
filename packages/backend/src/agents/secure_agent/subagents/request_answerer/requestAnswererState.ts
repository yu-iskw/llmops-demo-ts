import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

export const RequestAnswererStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  messages: MessagesAnnotation.spec.messages,
  ai_response: Annotation<string | undefined>(),
  feedback_message: Annotation<string | undefined>(),
  messageWindowSize: Annotation<number>(),
});

export type RequestAnswererState = typeof RequestAnswererStateAnnotation.State;
