<template>
  <v-container fluid class="fill-height pa-0">
    <ToastMessage />
    <v-row align="center" justify="center" class="fill-height mx-4">
      <v-col cols="12" sm="8" md="5" lg="4" style="max-width: 450px">
        <Card class="elevation-12 rounded-xl pb-4">
          <template #content>
            <v-toolbar dark flat height="80" class="content-card">
              <div class="w-100 d-flex justify-center align-center">
                <img src="@/assets/images/navigate.png" alt="navigate" width="65" height="65" />
              </div>
            </v-toolbar>
            <v-toolbar dark flat height="60" class="content-card">
              <div class="d-flex flex-column align-center justify-center text-center w-100">
                <div class="text-h5 mb-2 font-weight-bold text-orange">註冊會員</div>
              </div>
            </v-toolbar>
          </template>

          <template #subtitle>
            <v-form @submit.prevent="handleRegister">
              <TextField
                v-model="userName"
                label="請輸入使用者名稱"
                prepend-icon="mdi-account-circle"
                type="text"
                required
                variant="solo-filled"
                :rules="formRules.userNameRules"
                class="mb-4"
              />

              <TextField
                v-model="email"
                label="請輸入Email"
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
                required
                variant="solo-filled"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="formRules.passwordRules"
                class="mb-4"
              />

              <Button
                type="submit"
                block
                :class="['mb-4', 'register-btn', { 'opacity-80': isLoading }]"
                :isLoading="isLoading"
                label="註冊"
              />

              <router-link to="/login" class="text-decoration-none my-2">
                <Button
                  type="button"
                  color="white"
                  variant="text"
                  block
                  class="border-sm border-black text-black"
                >
                  <span class="text-black">返回登入頁面</span>
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
import { ref } from 'vue';
import { registerUser } from '@/services/firebaseService';
import router from '@/router';
import { RouterLink } from 'vue-router';
import { useMessageStore } from '@/stores/messageStore';
import ToastMessage from '@/components/toastMessage.vue';
import Button from '@/components/ui/Button.vue';
import TextField from '@/components/ui/TextField.vue';
import Card from '@/components/ui/Card.vue';
const email = ref('');
const userName = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const messageStore = useMessageStore();

const formRules = {
  userNameRules: [
    (v: string) => !!v || '請輸入使用者名稱',
    (v: string) => v.length >= 3 || '名稱長度至少為3個字符',
  ],
  emailRules: [
    (v: string) => !!v || '請輸入電子郵件',
    (v: string) => /.+@.+\..+/.test(v) || '請輸入有效的電子郵件',
  ],
  passwordRules: [
    (v: string) => !!v || '請輸入密碼',
    (v: string) => v.length >= 8 || '密碼長度至少為8個字符',
  ],
};

const handleRegister = async () => {
  try {
    console.log('註冊:', { email: email.value, password: password.value });
    isLoading.value = true;
    const result = await registerUser({
      name: userName.value,
      email: email.value,
      password: password.value,
    });
    if (result.success) {
      console.log('註冊成功:', result);
      router.push({ name: 'login', state: { msg: '註冊成功！前往登入' } });
    } else {
      switch (result.code) {
        case 'auth/email-already-in-use':
          messageStore.show('此Email已註冊過', 'error', 3000);
          break;
        default:
          messageStore.show('註冊失敗', 'error', 3000);
          break;
      }
    }
  } catch (err: unknown) {
    console.log('註冊過程發生錯誤:', err);
    messageStore.show('註冊過程發生錯誤', 'error', 3000);
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

.register-btn {
  background-color: #ff9800;
  color: white;
  font-weight: bold;
  &:hover {
    opacity: 0.8;
  }
}

.content-card {
  background-color: rgb(248, 250, 252);
}

.text-orange {
  color: rgb(234, 88, 12);
}
</style>
