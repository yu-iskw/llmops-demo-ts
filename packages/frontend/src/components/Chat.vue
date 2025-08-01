<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI Chat</h1>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.fromUser ? 'user-message' : 'ai-message']"
      >
        <div class="message-content">
          {{ message.text }}
        </div>
      </div>
    </div>

    <!-- Agent Selection Dropdown -->
    <div class="p-4 border-t border-gray-200">
      <label for="agent-select" class="block text-sm font-medium text-gray-700">Select Agent:</label>
      <select
        id="agent-select"
        v-model="selectedAgent"
        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="default">Default</option>
        <option value="creative">Creative</option>
        <option value="scientific">Scientific</option>
      </select>
    </div>

    <div class="input-container">
      <form @submit.prevent="sendMessage" class="message-form">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message..."
          :disabled="isLoading"
          class="message-input"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || isLoading"
          class="send-button"
        >
          {{ isLoading ? 'Sending...' : 'Send' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue';

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
}

const messages = reactive<Message[]>([]);
const newMessage = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement>();
const selectedAgent = ref('default'); // New state for selected agent

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: newMessage.value,
    fromUser: true
  };

  messages.push(userMessage);
  const messageToSend = newMessage.value;
  newMessage.value = '';
  isLoading.value = true;

  scrollToBottom();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageToSend,
        history: messages.filter(m => m.id !== userMessage.id),
        agentType: selectedAgent.value, // Pass selected agent type
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      fromUser: false
    };

    messages.push(aiMessage);

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            aiMessage.text += data.chunk;
            scrollToBottom();
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Sorry, there was an error processing your message.',
      fromUser: false
    };
    messages.push(errorMessage);
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.chat-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.user-message {
  align-self: flex-end;
  background: #007bff;
  color: white;
}

.ai-message {
  align-self: flex-start;
  background: #f1f3f4;
  color: #333;
}

.message-content {
  line-height: 1.4;
}

.input-container {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.message-form {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.message-input:focus {
  border-color: #007bff;
}

.send-button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #0056b3;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
