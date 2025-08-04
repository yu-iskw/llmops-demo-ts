import { Ref } from "vue";

export interface ChatMessage {
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
  agentType: string;
}

// Temporarily removed debugLog utility as part of phased refactor.
// It will be re-added if necessary after core reactivity issue is resolved.

export class ChatService {
  static async sendMessage(
    message: string,
    history: ChatMessage[],
    agentType: string = "default",
  ): Promise<string> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.map((m) => ({
          role: m.fromUser ? "user" : "assistant",
          content: m.text, // Removed .value since text is now plain string
        })),
        agentType,
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
}
