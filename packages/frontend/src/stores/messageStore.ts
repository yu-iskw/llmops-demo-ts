import { defineStore } from "pinia";
import type { UIChatMessage } from "../services/chatService";

export const useMessageStore = defineStore("messageStore", {
  state: () => ({
    messages: [] as UIChatMessage[],
    isLoading: false,
  }),
  actions: {
    addMessage(message: UIChatMessage) {
      this.messages.push(message);
    },
    updateLastMessage(text: string) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1];
        if (!lastMessage.fromUser) {
          lastMessage.text += text;
        }
      }
    },
    setLastMessageText(text: string) {
      if (this.messages.length > 0) {
        const lastMessage = this.messages[this.messages.length - 1];
        if (!lastMessage.fromUser) {
          lastMessage.text = text;
        }
      }
    },
    setIsLoading(loading: boolean) {
      this.isLoading = loading;
    },
    clearMessages() {
      this.messages = [];
    },
  },
});
