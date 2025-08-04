<template>
  <div class="chat-container">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-content">
        <h1>AI Assistant</h1>
        <p class="header-subtitle">Powered by Gemini</p>
        <div class="controls">
          <div class="select-wrapper">
            <label for="agent-select">Agent:</label>
            <select id="agent-select" v-model="selectedAgentType">
              <option v-for="agent in agentTypes" :key="agent.name" :value="agent.name">
                {{ agent.name }}
              </option>
            </select>
          </div>
          <div class="select-wrapper">
            <label for="model-select">Model:</label>
            <select id="model-select" v-model="selectedModelName">
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            </select>
          </div>
        </div>
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
import { ref, onMounted } from 'vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import { ChatService, type UIChatMessage, type AgentType } from '../services/chatService';
import { useMessageStore } from '../stores/messageStore';
import { storeToRefs } from 'pinia';

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

// Pinia Store
const messageStore = useMessageStore();
const { messages, isLoading } = storeToRefs(messageStore); // Use storeToRefs to maintain reactivity

// Direct reactive state
// const messages = reactive<UIChatMessage[]>([]); // Removed, now from store
// const isLoading = ref(false); // Removed, now from store
const selectedAgentType = ref<string>('default'); // Default agent type
const selectedModelName = ref<string>('gemini-2.5-flash'); // Default model name
const agentTypes = ref<AgentType[]>([]); // To store fetched agent types

// Fetch agent types on mount
onMounted(async () => {
  try {
    agentTypes.value = await ChatService.getAgentTypes();
    debugLog('info', 'Fetched agent types', agentTypes.value);
  } catch (error) {
    console.error('Error fetching agent types:', error);
    debugLog('error', 'Failed to fetch agent types', error);
  }

  const testMessage: UIChatMessage = {
    id: 'test-1',
    text: 'Hello! I\'m your AI assistant. How can I help you today?',
    fromUser: false
  };
  messageStore.addMessage(testMessage); // Use store action
});

const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;

  debugLog('info', 'User sent message', { message, selectedAgentType: selectedAgentType.value, selectedModelName: selectedModelName.value });

  // Add user message
  const userMessage: UIChatMessage = {
    id: Date.now().toString(),
    text: message,
    fromUser: true
  };
  messageStore.addMessage(userMessage); // Use store action

  debugLog('debug', 'User message added', { userMessage });

  // Set loading state
  messageStore.setIsLoading(true); // Use store action

  try {
    // Pass a copy of messages from the store to avoid direct mutation of store state outside of actions
    const history = messages.value.map(m => ({ role: m.fromUser ? "user" : "assistant", content: m.text }));

    debugLog('debug', 'Starting chat request', {
      message,
      historyLength: history.length,
      agentType: selectedAgentType.value,
      modelName: selectedModelName.value
    });

    // Send message and get response with selected agent type and model name
    const response = await ChatService.sendMessage(message, history, selectedAgentType.value, selectedModelName.value);

    debugLog('info', 'Received response from API', { response });

    // Create AI message with the response
    const aiMessage: UIChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response,
      fromUser: false
    };
    messageStore.addMessage(aiMessage); // Use store action

    debugLog('debug', 'AI message added', { aiMessage });

    debugLog('info', 'Chat request completed successfully');
  } catch (error) {
    console.error('Error sending message:', error);

    // Add error message
    const errorMessage: UIChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Sorry, there was an error processing your message. Please try again.',
      fromUser: false
    };
    messageStore.addMessage(errorMessage); // Use store action
  } finally {
    messageStore.setIsLoading(false); // Use store action
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

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.select-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-wrapper label {
  color: #ececf1;
  font-size: 14px;
}

.select-wrapper select {
  background-color: #343541;
  color: #ececf1;
  border: 1px solid #565869;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #10a37f;
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
