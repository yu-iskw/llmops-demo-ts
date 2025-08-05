import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "../../commonAgentState";

export const InputSanitizerStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
  sanitized_message: Annotation<string | undefined>(),
  is_suspicious: Annotation<boolean>(),
  suspicious_reason: Annotation<string | undefined>(),
  confidence: Annotation<number | undefined>(),
});

export type InputSanitizerState = typeof InputSanitizerStateAnnotation.State;
