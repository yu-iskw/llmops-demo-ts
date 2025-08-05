import { Annotation } from "@langchain/langgraph";
import { FunctionCall } from "@google/genai";

// Graph state
export const DefaultAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>,
  messages: Annotation<Array<any>>({
    // Add messages channel
    default: () => [],
    reducer: (s: Array<any>, a: Array<any>) => s.concat(a),
  }),
  function_calls: Annotation<Array<FunctionCall>>({
    default: () => [],
    reducer: (s: Array<FunctionCall>, a: Array<FunctionCall>) => s.concat(a),
  }),
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type DefaultAgentState = typeof DefaultAgentStateAnnotation.State;
