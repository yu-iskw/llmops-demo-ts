<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI Chat</h1>
    </div>

    <MessageList :messages="messages" />

    <MessageInput
      :is-loading="isLoading"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, type Ref, onMounted } from 'vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import { ChatService, type ChatMessage } from '../services/chatService';

// Debug logging utility
const debugLog = (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [UI-${level.toUpperCase()}] ${message}`;

  if (data) {
    console.group(logMessage);
    console.log('Data:', data);
    console.groupEnd();
  } else {
    console.log(logMessage);
  }
};

// Direct reactive state
const messages = reactive<ChatMessage[]>([]);
const isLoading = ref(false);

// Add a test message on mount to verify UI is working
onMounted(() => {
  const testMessage: ChatMessage = {
    id: 'test-1',
    text: 'Welcome to AI Chat! Type a message to get started.',
    fromUser: false
  };
  messages.push(testMessage);
});

const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;

  debugLog('info', 'User sent message', { message });

  // Add user message
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text: message, // Use plain string instead of ref
    fromUser: true
  };
  messages.push(userMessage);

  debugLog('debug', 'User message added', { userMessage });

  // Set loading state
  isLoading.value = true;

  try {
    // Include the user message in history for proper context
    const history = [...messages]; // Include all messages including the one we just added

    debugLog('debug', 'Starting chat request', {
      message,
      historyLength: history.length
    });

    // Send message and get response
    const response = await ChatService.sendMessage(message, history, 'default');

    debugLog('info', 'Received response from API', { response });

    // Create AI message with the response
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response, // Use plain string instead of ref
      fromUser: false
    };
    messages.push(aiMessage);

    debugLog('debug', 'AI message added', { aiMessage });

    debugLog('info', 'Chat request completed successfully');
  } catch (error) {
    console.error('Error sending message:', error);

    // Add error message
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Sorry, there was an error processing your message.',
      fromUser: false
    };
    messages.push(errorMessage);
  } finally {
    isLoading.value = false;
    debugLog('debug', 'Loading state set to false');
  }
};
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
</style>
