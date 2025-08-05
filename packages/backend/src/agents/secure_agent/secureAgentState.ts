import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "./commonAgentState";
import { InputSanitizerStateAnnotation } from "./subagents/input_sanitizer/inputSanitizerState";
import { OutputSanitizerStateAnnotation } from "./subagents/output_sanitizer/outputSanitizerState";
import { RequestAnswererStateAnnotation } from "./subagents/request_answerer/requestAnswererState";

const SecureAgentSpecificAnnotations = {
  next_step: Annotation<string | undefined>(),
};

export const SecureAgentStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
  ...InputSanitizerStateAnnotation.spec,
  ...OutputSanitizerStateAnnotation.spec,
  ...RequestAnswererStateAnnotation.spec, // This will bring in the common state again, but it's safe due to spread behavior.
  ...SecureAgentSpecificAnnotations,
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type SecureAgentState = typeof SecureAgentStateAnnotation.State;
