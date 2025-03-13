<template>
  <v-text-field v-bind="$attrs" :label="label"></v-text-field>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  label?: string;
}

defineProps<Props>();
</script>
