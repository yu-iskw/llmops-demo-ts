<template>
  <div class="input-container">
    <form @submit.prevent="handleSubmit" class="message-form">
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
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isLoading: boolean;
}

interface Emits {
  (e: 'send-message', message: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const newMessage = ref('');

const handleSubmit = () => {
  if (!newMessage.value.trim() || props.isLoading) return;

  const message = newMessage.value;
  newMessage.value = '';
  emit('send-message', message);
};
</script>

<style scoped>
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
