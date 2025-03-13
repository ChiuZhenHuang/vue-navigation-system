<template>
  <v-snackbar
    v-model="messageStore.visible"
    :color="messageStore.color"
    :timeout="messageStore.timeout"
    bottom
  >
    {{ messageStore.message }}
    <template v-slot:actions>
      <Button color="white" variant="text" @click="messageStore.visible = false" label="Close" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useMessageStore } from '@/stores/messageStore';
import Button from '@/components/ui/Button.vue';
const messageStore = useMessageStore();
</script>
