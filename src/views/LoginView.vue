<template>
  <v-container fluid class="fill-height pa-0">
    <ToastMessage />
    <v-row align="center" justify="center" class="fill-height mx-4">
      <v-col cols="12" sm="8" md="5" lg="4" style="max-width: 450px">
        <Card class="elevation-12 rounded-xl pb-4 bg-grey-lighten-5">
          <template #content>
            <v-toolbar dark flat height="80" class="bg-grey-lighten-5">
              <div class="w-100 d-flex justify-center align-center">
                <img src="@/assets/images/navigate.png" alt="navigate" width="65" height="65" />
              </div>
            </v-toolbar>
            <v-toolbar dark flat height="80" class="bg-grey-lighten-5">
              <div class="d-flex flex-column align-center justify-center text-center w-100">
                <div class="text-h5 mb-2 font-weight-bold text-orange">歡迎使用導航紀錄系統</div>
                <div class="text-subtitle-2 text-slate">請登入開始您的旅程</div>
              </div>
            </v-toolbar>
          </template>
          <template #subtitle>
            <v-form @submit.prevent="handleLogin">
              <TextField
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
                variant="solo-filled"
                :rules="formRules.emailRules"
                class="mb-4"
              />

              <TextField
                v-model="password"
                label="密碼"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                required
                variant="solo-filled"
                :rules="formRules.passwordRules"
                class="mb-4"
              />

              <Button
                type="submit"
                block
                :class="['mb-4', 'login-btn', { 'opacity-80': isLoading }]"
                :isLoading="isLoading"
                label="登入"
              />

              <router-link to="/register" class="text-decoration-none my-2">
                <Button
                  type="button"
                  color="white"
                  variant="text"
                  block
                  class="border-sm border-black text-black"
                >
                  <span class="text-black">還不是會員?前往註冊</span>
                </Button>
              </router-link>
            </v-form>
          </template>
        </Card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import router from '@/router';
import type { userData } from '@/types/userType';
import { loginUser } from '@/services/firebaseService';
import { useMessageStore } from '@/stores/messageStore';
import { useUserStore } from '@/stores/userStore';
import ToastMessage from '@/components/toastMessage.vue';
import Button from '@/components/ui/Button.vue';
import TextField from '@/components/ui/TextField.vue';
import Card from '@/components/ui/Card.vue';

const messageStore = useMessageStore();
const userStore = useUserStore();

onMounted(() => {
  const msg = window.history.state?.msg as string;
  if (msg) messageStore.show(msg, 'success', 3000);
});

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const formRules = {
  emailRules: [
    (v: string) => !!v || '請輸入電子郵件',
    (v: string) => /.+@.+\..+/.test(v) || '請輸入有效的電子郵件',
  ],
  passwordRules: [
    (v: string) => !!v || '請輸入密碼',
    (v: string) => v.length >= 8 || '密碼長度至少為8個字符',
  ],
};

const handleLogin = async () => {
  isLoading.value = true;
  try {
    console.log('登入:', { email: email.value, password: password.value });
    const result = await loginUser({ email: email.value, password: password.value });
    if (result.success) {
      const { token, uid, userName } = result as Required<userData>;

      userStore.setUserName(userName);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      document.cookie = `token=${token};expires=${tomorrow.toUTCString()}`;
      document.cookie = `uid=${uid};expires=${tomorrow.toUTCString()}`;
      console.log('登入成功:', result);
      // console.log('登入成功2:', result);
      router.push({ path: 'layout/home', state: { msg: '登入成功！' } });
    } else {
      console.log('登入失敗:', result.error);
      messageStore.show('登入失敗', 'error', 3000);
    }
  } catch (err: unknown) {
    messageStore.show('登入過程發生錯誤', 'error', 3000);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.v-container {
  background-color: rgb(255, 247, 237);
  min-height: 100vh;
}

.login-btn {
  background-color: #ff9800;
  color: white;
  font-weight: bold;
  &:hover {
    opacity: 0.8;
  }
}

.text-orange {
  color: rgb(234, 88, 12);
}

.text-slate {
  color: rgb(148, 163, 184);
}
</style>
