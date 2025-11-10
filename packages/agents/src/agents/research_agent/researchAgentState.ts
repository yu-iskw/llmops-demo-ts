import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

// Graph state
export const SearchAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  response: Annotation<string | null>({
    default: () => null,
    reducer: (current, update) => update ?? current,
  }),
  search_queries: Annotation<string[]>({
    default: () => [],
    reducer: (s: string[], a: string[]) => a, // Replace instead of concatenate
  }),
  search_results: Annotation<Array<{ query: string; result: string }>>({
    default: () => [],
    reducer: (
      s: Array<{ query: string; result: string }>,
      a: Array<{ query: string; result: string }>,
    ) => a, // Replace instead of concatenate
  }),
  // Use MessagesAnnotation for proper message history handling
  ...MessagesAnnotation.spec,
  function_calls: Annotation<Array<FunctionCall>>({
    default: () => [],
    reducer: (s: Array<FunctionCall>, a: Array<FunctionCall>) => a, // Replace instead of concatenate
  }),
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type SearchAgentState = typeof SearchAgentStateAnnotation.State;
