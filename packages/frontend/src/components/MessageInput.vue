<template>
  <div class="input-container">
    <div class="input-wrapper">
      <div class="input-form">
        <div class="textarea-container">
          <textarea
            ref="textareaRef"
            v-model="newMessage"
            placeholder="Message AI Assistant..."
            :disabled="isLoading"
            class="message-textarea"
            rows="1"
            @keydown="handleKeydown"
            @input="autoResize"
          ></textarea>
          <button
            type="button"
            :disabled="!newMessage.trim() || isLoading"
            class="send-button"
            @click="handleSubmit"
          >
            <svg
              v-if="!isLoading"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="currentColor"
              />
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>
        <div class="input-footer">
          <p class="input-disclaimer">
            AI Assistant can make mistakes. Consider checking important
            information.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

interface Props {
  isLoading: boolean;
}

interface Emits {
  (e: "send-message", message: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const newMessage = ref("");
const textareaRef = ref<HTMLTextAreaElement>();

const handleSubmit = () => {
  if (!newMessage.value.trim() || props.isLoading) return;

  const message = newMessage.value;
  newMessage.value = "";
  emit("send-message", message);

  // Reset textarea height
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  });
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
    textareaRef.value.style.height =
      Math.min(textareaRef.value.scrollHeight, 200) + "px";
  }
};
</script>

<style scoped>
.input-container {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 16px;
}

.input-wrapper {
  background-color: #343541;
  border: 1px solid #565869;
  border-radius: 12px;
  padding: 12px;
  transition: border-color 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #10a37f;
}

.input-form {
  display: flex;
  flex-direction: column;
}

.textarea-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  min-height: 44px;
}

.message-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ececf1;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  min-height: 24px;
  max-height: 200px;
  font-family: inherit;
  padding: 8px 0;
}

.message-textarea::placeholder {
  color: #8e8ea0;
}

.message-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: #10a37f;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background-color: #0d8a6f;
}

.send-button:disabled {
  background-color: #565869;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.input-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #4a4b53;
}

.input-disclaimer {
  color: #8e8ea0;
  font-size: 12px;
  margin: 0;
  text-align: center;
  line-height: 1.4;
}
</style>
