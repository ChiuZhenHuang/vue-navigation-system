<template>
  <Navbar />
  <router-view :key="$route.fullPath" />
</template>

<script setup lang="ts">
import router from '@/router';
import { RouterView } from 'vue-router';
import Navbar from '@/components/layout/Navbar.vue';
import { getCookie } from '@/utils/methods';
import { onMounted } from 'vue';
import { useUserRecordStore } from '@/stores/userRecordStore';
import { useUserStore } from '@/stores/userStore';

const userRecordStore = useUserRecordStore();
const userStore = useUserStore();

const getTokenAndUid = async (): Promise<{ token: string; uid: string } | undefined> => {
  const token = getCookie('token') ?? '';
  const uid = getCookie('uid') ?? '';

  // 如果沒有token，則跳轉到login頁面
  if (!token) {
    router.push('/login');
    return;
  }
  if (token && uid) return { token, uid };
};

onMounted(async () => {
  const result = await getTokenAndUid();
  if (result?.token && result?.uid) {
    userStore.getUserDataApi();
    userRecordStore.getUserRecordApi(result.uid);
  }
});
</script>
