import { HumanMessage, AIMessage } from "@langchain/core/messages";

export interface InputSanitizerInputs {
  user_message: string;
  messages: (HumanMessage | AIMessage)[];
  messageWindowSize: number;
}

export interface InputSanitizerOutputs {
  is_suspicious: boolean;
  sanitized_message: string;
}
