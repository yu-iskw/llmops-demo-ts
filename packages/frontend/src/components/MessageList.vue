<template>
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
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import type { ChatMessage } from '../services/chatService';

interface Props {
  messages: ChatMessage[];
}

const props = defineProps<Props>();
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

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
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
</style>
