import { HumanMessage, AIMessage } from "@langchain/core/messages";
import type { RoutedDomain } from "../../../../routedAgentState";

export interface RoutedE2EInputs {
  user_message: string;
  messages: Array<HumanMessage | AIMessage>;
  messageWindowSize: number;
}

export interface RoutedE2EOutputs {
  route: RoutedDomain;
  ai_response: string;
  is_sensitive: boolean;
  confidence_probability?: number;
  suspicious_probability?: number;
}
