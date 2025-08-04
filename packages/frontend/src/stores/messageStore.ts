import { reactive } from "vue";
import type { ChatMessage } from "../services/chatService";

export class MessageStore {
  private messages = reactive<ChatMessage[]>([]);
  private isLoading = reactive({ value: false });

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  getIsLoading(): boolean {
    return this.isLoading.value;
  }

  setIsLoading(loading: boolean): void {
    this.isLoading.value = loading;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  updateLastMessage(text: string): void {
    if (this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (!lastMessage.fromUser) {
        // Force reactivity by creating a new object
        const updatedMessage = {
          ...lastMessage,
          text: lastMessage.text + text,
        };
        // Replace the last message in the array
        this.messages[this.messages.length - 1] = updatedMessage;
      }
    }
  }

  clearMessages(): void {
    this.messages.length = 0;
  }
}

// Export a singleton instance
export const messageStore = new MessageStore();
