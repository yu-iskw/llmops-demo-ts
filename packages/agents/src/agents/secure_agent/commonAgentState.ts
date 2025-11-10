import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const CommonAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>(),
  ...MessagesAnnotation.spec,
  ai_response: Annotation<string | undefined>(),
  messageWindowSize: Annotation<number>(),
});

export type CommonAgentState = typeof CommonAgentStateAnnotation.State;
