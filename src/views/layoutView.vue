<template>
  <Navbar :user-name="userInfo.userName" />
  <router-view />
</template>

<script setup lang="ts">
import router from '@/router';
import Navbar from '@/components/layout/Navbar.vue';
import { getCookie } from '@/utils/methods';
import { onMounted, ref } from 'vue';
import { getUsersData, getUserRecords } from '@/services/firebaseService';

const userInfo = ref({
  email: '',
  userName: '',
});

const getUserData = async () => {
  const token = getCookie('token') ?? '';
  const uid = getCookie('uid') ?? '';

  // 如果沒有token，則跳轉到login頁面
  if (!token) {
    router.push('/login');
    return;
  }

  if (uid) {
    try {
      const totalUserData = await getUsersData();
      const { email, name } = await getUserRecords(uid);

      // 更新 userInfo 的值
      userInfo.value.email = email;
      userInfo.value.userName = name;

      console.log({ totalUserData });
      console.log({ email, name });
    } catch (error) {
      console.error('取得用戶資料錯誤', error);
    }
  }
};

onMounted(() => {
  getUserData();
});
</script>
