import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "../../../secure_agent/commonAgentState";

export interface OutputSanitizerOutput {
  isSensitive: boolean;
  reason: string;
  /** Model confidence that the binary classification is correct; in [0, 1]. */
  confidenceProbability: number;
  /** Model-estimated probability the assistant output is sensitive; in [0, 1]. */
  suspiciousProbability: number;
}

export const OutputSanitizerStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
  is_sensitive: Annotation<boolean>(),
  feedback_message: Annotation<string | undefined>(),
  confidence_probability: Annotation<number | undefined>(),
  suspicious_probability: Annotation<number | undefined>(),
});

export type OutputSanitizerState = typeof OutputSanitizerStateAnnotation.State;
