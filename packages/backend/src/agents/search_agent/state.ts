import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { FunctionCall } from "@google/genai";

// The state for our research agent
export const SearchAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>,
  report: Annotation<string | null>({
    default: () => null,
    reducer: (current, update) => update ?? current,
  }),
  messages: Annotation<Array<BaseMessage>>({
    default: () => [],
    reducer: (s: Array<BaseMessage>, a: Array<BaseMessage>) => s.concat(a),
  }),
  function_calls: Annotation<Array<FunctionCall>>({
    default: () => [],
    reducer: (s: Array<FunctionCall>, a: Array<FunctionCall>) => s.concat(a),
  }),
});

export type SearchAgentState = typeof SearchAgentStateAnnotation.State;
