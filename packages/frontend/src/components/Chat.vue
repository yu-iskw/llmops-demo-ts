<template>
  <div class="chat-container">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-content">
        <h1>AI Assistant</h1>
        <p class="header-subtitle">Powered by Gemini</p>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="messages-area">
      <MessageList :messages="messages" :is-loading="isLoading" />
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <MessageInput
        :is-loading="isLoading"
        @send-message="handleSendMessage"
      />
    </div>
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
    text: 'Hello! I\'m your AI assistant. How can I help you today?',
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
      text: 'Sorry, there was an error processing your message. Please try again.',
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
  background-color: #343541;
  color: #ececf1;
}

.chat-header {
  background-color: #202123;
  border-bottom: 1px solid #4a4b53;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 768px;
  margin: 0 auto;
  text-align: center;
}

.chat-header h1 {
  margin: 0;
  color: #ececf1;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.header-subtitle {
  color: #8e8ea0;
  font-size: 14px;
  margin: 0;
}

.messages-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.input-area {
  background-color: #343541;
  border-top: 1px solid #4a4b53;
  padding: 20px 0;
  position: sticky;
  bottom: 0;
}
</style>
