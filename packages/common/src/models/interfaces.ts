import { ChatMessage } from "./Chat";

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  agentType?: "default" | "research" | "secure";
  modelName?: string;
  sessionId?: string;
}

export interface AgentType {
  name: "default" | "research" | "secure";
  description: string;
}
