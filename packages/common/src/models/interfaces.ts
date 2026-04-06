import { ChatMessage } from "./Chat";

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  agentType?: "default" | "research" | "secure" | "routed";
  modelName?: string;
  sessionId?: string;
}

export interface AgentType {
  name: "default" | "research" | "secure" | "routed";
  description: string;
}
