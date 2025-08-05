export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  agentType?: "default" | "research";
  modelName?: string;
  sessionId?: string;
}
