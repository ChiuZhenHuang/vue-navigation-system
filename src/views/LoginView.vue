<template>
  <v-container fluid class="fill-height pa-0">
    <ToastMessage />
    <v-row align="center" justify="center" class="fill-height mx-4">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12 rounded-xl">
          <v-toolbar dark flat height="80" class="content-card">
            <div class="w-100 d-flex justify-center align-center">
              <img src="@/assets/images/navigate.png" alt="navigate" width="65" height="65" />
            </div>
          </v-toolbar>
          <v-toolbar dark flat height="80" class="content-card">
            <div class="d-flex flex-column align-center justify-center text-center w-100">
              <div class="text-h5 mb-2 font-weight-bold text-orange">歡迎使用導航紀錄系統</div>
              <div class="text-subtitle-2 text-slate">請登入開始您的旅程</div>
            </div>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
                :rules="formRules.emailRules"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="密碼"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                :rules="formRules.passwordRules"
                class="mb-4"
              ></v-text-field>

              <v-btn block type="submit" class="mb-4 login-btn" :disabled="isLoading">
                <div class="d-flex align-center justify-center">
                  <v-progress-circular
                    v-if="isLoading"
                    indeterminate
                    size="20"
                    width="2"
                    color="white"
                    class="mr-2"
                  ></v-progress-circular>
                  登入
                </div>
              </v-btn>

              <div class="text-center py-2">
                <router-link to="/register" class="text-decoration-none">
                  還不是會員?前往註冊
                </router-link>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loginUser } from '@/services/firebaseService';
import router from '@/router';
import type { userData } from '@/types/userType';
import { useNotificationStore } from '@/stores/notification';
import ToastMessage from '@/components/toastMessage.vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const notification = useNotificationStore();
const userStore = useUserStore();
onMounted(() => {
  const msg = window.history.state?.msg as string;
  if (msg) notification.show(msg, 'success', 3000);
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

      router.push({ path: 'layout/home', state: { msg: '登入成功！' } });
      console.log('登入成功:', result);
    } else {
      console.log('登入失敗:', result.error);
      notification.show('登入失敗', 'error', 3000);
    }
  } catch (err: unknown) {
    notification.show('登入過程發生錯誤', 'error', 3000);
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
}

.content-card {
  background-color: rgb(248, 250, 252);
}

.text-orange {
  color: rgb(234, 88, 12);
}

.text-slate {
  color: rgb(148, 163, 184);
}
</style>
