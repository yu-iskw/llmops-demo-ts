import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

// Graph state
export const DefaultAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  // Use MessagesAnnotation for proper message history handling
  ...MessagesAnnotation.spec,
  function_calls: Annotation<Array<FunctionCall>>({
    default: () => [],
    reducer: (s: Array<FunctionCall>, a: Array<FunctionCall>) => a, // Replace instead of concatenate
  }),
  messageWindowSize: Annotation<number>(),
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type DefaultAgentState = typeof DefaultAgentStateAnnotation.State;
