import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "../../commonAgentState";

export const RequestAnswererStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
});

export type RequestAnswererState = typeof RequestAnswererStateAnnotation.State;
