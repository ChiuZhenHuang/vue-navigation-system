<template>
  <v-card v-bind="$attrs">
    <v-card-title v-if="$slots.title">
      <slot name="title"></slot>
    </v-card-title>
    <v-card-text v-if="$slots.content">
      <slot name="content"></slot>
    </v-card-text>
    <v-card-subtitle v-if="$slots.subtitle" class="custom-subtitle">
      <slot name="subtitle"></slot>
    </v-card-subtitle>
    <v-card-actions v-if="$slots.actions">
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts"></script>

<style scoped>
/* (移除透明度) */
.custom-subtitle {
  opacity: 1;
}
</style>
