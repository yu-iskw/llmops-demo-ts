import { ChatMessage as CommonChatMessage } from "@llmops-demo/common"; // Import common ChatMessage

export interface UIChatMessage {
  id: string;
  text: string; // Changed from Ref<string> to plain string
  fromUser: boolean;
}

export interface ChatRequest {
  message: string;
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  agentType?: string;
  modelName?: string;
}

export interface AgentType {
  name: string;
  description: string;
}

// Temporarily removed debugLog utility as part of phased refactor.
// It will be re-added if necessary after core reactivity issue is resolved.

export class ChatService {
  static async sendMessage(
    message: string,
    history: UIChatMessage[],
    agentType: string = "default",
    modelName: string = "gemini-2.5-flash", // Add modelName parameter
    sessionId?: string, // Add sessionId parameter
  ): Promise<string> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.map(
          (m): CommonChatMessage => ({
            role: m.fromUser ? "user" : "assistant",
            content: m.text || "", // Ensure content is always a string
          }),
        ),
        agentType,
        modelName,
        sessionId, // Pass sessionId
      } as ChatRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send message: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    return data.chunk;
  }

  static async getAgentTypes(): Promise<AgentType[]> {
    const response = await fetch("/api/chat/agent-types");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch agent types: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }
    return await response.json();
  }
}
