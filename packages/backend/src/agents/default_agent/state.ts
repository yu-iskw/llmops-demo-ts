import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const DefaultAgentGraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  agentType: Annotation<string>,
});

export type DefaultAgentState = typeof DefaultAgentGraphState.State;
