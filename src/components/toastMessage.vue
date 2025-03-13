<template>
  <v-snackbar
    v-model="messageStore.visible"
    :color="messageStore.color"
    :timeout="messageStore.timeout"
    bottom
  >
    {{ messageStore.message }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="messageStore.visible = false"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useMessageStore } from '@/stores/messageStore';
const messageStore = useMessageStore();
</script>
