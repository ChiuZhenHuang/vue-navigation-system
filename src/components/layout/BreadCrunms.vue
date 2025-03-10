<template>
  <v-breadcrumbs class="py-2">
    <template v-slot:prepend>
      <v-icon icon="mdi-home" size="small" @click="router.push('/layout/home')" />
    </template>
    <v-breadcrumbs-divider>/</v-breadcrumbs-divider>
    <v-breadcrumbs-item>
      {{ currentPageTitle }}
    </v-breadcrumbs-item>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();

const pathToTitle: Record<string, string> = {
  '/layout/home': '導航',
  '/layout/task': '每週任務',
  '/layout/rank': '排行榜',
  '/layout/user-info': '個人資訊',
  '/layout/car-setting': '車款設置',
};

// 根據路由顯示當前頁面
const currentPageTitle = computed(() => {
  return pathToTitle[router.currentRoute.value.path] || '';
});
</script>
