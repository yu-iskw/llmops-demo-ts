import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "./commonAgentState";

export const SecureAgentStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
  sanitized_message: Annotation<string | undefined>(),
  is_suspicious: Annotation<boolean>(),
  is_sensitive: Annotation<boolean>(),
  next_step: Annotation<string | undefined>(),
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type SecureAgentState = typeof SecureAgentStateAnnotation.State;
