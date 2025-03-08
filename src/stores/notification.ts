import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const visible = ref(false);
  const message = ref('');
  const color = ref('success');
  const timeout = ref(3000);

  const show = (msg: string, msgColor = 'success', msgTimeout = 3000) => {
    message.value = msg;
    color.value = msgColor;
    timeout.value = msgTimeout;
    visible.value = true;
  };

  return { visible, message, color, timeout, show };
});
