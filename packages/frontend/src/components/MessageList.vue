<template>
  <div class="messages-container" ref="messagesContainer">
    <div class="messages-wrapper">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-group', message.fromUser ? 'user-group' : 'ai-group']"
      >
        <!-- Avatar -->
        <div class="message-avatar">
          <div v-if="message.fromUser" class="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
          </div>
          <div v-else class="ai-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <!-- Message Content -->
        <div class="message-content">
          <div class="message-text">
            {{ message.text }}
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="message-group ai-group">
        <div class="message-avatar">
          <div class="ai-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import type { UIChatMessage } from '../services/chatService';

interface Props {
  messages: UIChatMessage[];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const messagesContainer = ref<HTMLElement>();

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Watch for new messages and scroll to bottom
watch(() => props.messages.length, scrollToBottom);
watch(() => props.messages, scrollToBottom, { deep: true });
watch(() => props.isLoading, scrollToBottom);

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  height: 100%;
}

.messages-wrapper {
  max-width: 768px;
  margin: 0 auto;
  padding: 0;
}

.message-group {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #4a4b53;
}

.message-group:last-child {
  border-bottom: none;
}

.user-group {
  background-color: #343541;
}

.ai-group {
  background-color: #444654;
}

.message-avatar {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  margin-right: 16px;
  margin-top: 4px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 2px;
  background-color: #5436da;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ai-avatar {
  width: 30px;
  height: 30px;
  border-radius: 2px;
  background-color: #10a37f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 46px);
}

.message-text {
  color: #ececf1;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #8e8ea0;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
