import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { RoutedDomain } from "../../../../../routedAgentState";

export interface RouterEvalInputs {
  user_message: string;
  messages: Array<HumanMessage | AIMessage>;
  messageWindowSize: number;
}

export interface RouterEvalOutputs {
  route: RoutedDomain;
}
