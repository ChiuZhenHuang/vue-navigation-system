<template>
  <v-btn v-bind="$attrs">
    <div class="d-flex align-center justify-center">
      <v-progress-circular
        v-if="isLoading"
        indeterminate
        size="20"
        width="2"
        color="white"
        class="mr-2"
      />
      <slot>
        <span v-if="label" v-html="label"></span>
      </slot>
    </div>
  </v-btn>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
  isLoading?: boolean;
}

defineProps<Props>();
</script>
