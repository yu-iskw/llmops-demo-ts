import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "../../commonAgentState";

export interface OutputSanitizerOutput {
  isSensitive: boolean;
  reason: string;
}

export const OutputSanitizerStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
  is_sensitive: Annotation<boolean>(),
  feedback_message: Annotation<string | undefined>(),
});

export type OutputSanitizerState = typeof OutputSanitizerStateAnnotation.State;
