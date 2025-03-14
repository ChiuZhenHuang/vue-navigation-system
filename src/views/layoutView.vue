<template>
  <Navbar />
  <BreadCrunms />
  <router-view :key="$route.fullPath" />

  <Button
    v-show="showScrollTop"
    @click="scrollToTop"
    icon="mdi-chevron-up"
    color="orange-darken-2"
    :style="{ position: 'fixed', bottom: '16px', right: '16px' }"
    class="mb-4 me-4"
  >
    <v-icon icon="mdi-chevron-up" />
  </Button>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import router from '@/router';
import { RouterView } from 'vue-router';
import { useUserRecordStore } from '@/stores/userRecordStore';
import { getCookie } from '@/utils/methods';
import { useUserStore } from '@/stores/userStore';
import Navbar from '@/components/layout/Navbar.vue';
import BreadCrunms from '@/components/layout/BreadCrunms.vue';
import Button from '@/components/ui/Button.vue';

const userRecordStore = useUserRecordStore();
const userStore = useUserStore();
const showScrollTop = ref(false);

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

// 高度大於100px時顯示回到頂部按鈕
const handleScroll = () => (showScrollTop.value = window.scrollY > 100);

// 回到頂部
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

onMounted(async () => {
  const result = await getTokenAndUid();
  if (result?.token && result?.uid) {
    userStore.getUserDataApi();
    userRecordStore.getUserRecordApi(result.uid);
  }
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
