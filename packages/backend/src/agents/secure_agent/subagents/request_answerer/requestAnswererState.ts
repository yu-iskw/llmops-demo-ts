import { Annotation } from "@langchain/langgraph";
import { CommonAgentStateAnnotation } from "../../commonAgentState";

export const RequestAnswererStateAnnotation = Annotation.Root({
  ...CommonAgentStateAnnotation.spec,
  feedback_message: Annotation<string | undefined>(),
});

export type RequestAnswererState = typeof RequestAnswererStateAnnotation.State;
