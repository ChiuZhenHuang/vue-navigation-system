<template>
  <v-snackbar
    v-model="notification.visible"
    :color="notification.color"
    :timeout="notification.timeout"
    bottom
  >
    {{ notification.message }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="notification.visible = false"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification';
const notification = useNotificationStore();
</script>
