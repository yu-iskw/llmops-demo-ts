export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  agentType?: "default" | "research";
  modelName?: string;
  sessionId?: string;
}

export interface AgentType {
  name: string;
  description: string;
}
