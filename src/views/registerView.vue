<template>
  <v-container fluid class="fill-height pa-0">
    <v-row align="center" justify="center" class="fill-height mx-4">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-lg">
          <v-toolbar color="primary" dark flat class="py-4">
            <div class="d-flex flex-column align-center justify-center text-center w-100">
              <!-- <img src="@/assets/images/navigate.png" alt="navigate" width="60" height="60" /> -->
              <div class="text-h5 mb-2">註冊會員</div>
            </div>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="userName"
                label="請輸入使用者名稱"
                prepend-icon="mdi-account-circle"
                type="text"
                required
                :rules="formRules.userNameRules"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="請輸入Email"
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

              <v-btn color="primary" block type="submit" class="mb-4"> 註冊 </v-btn>

              <div class="text-center py-2">
                <router-link to="/login" class="text-decoration-none"> 返回登入頁面 </router-link>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { registerUser } from '@/services/firebaseService';
import router from '@/router';

const email = ref('');
const userName = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

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
    const result = await registerUser({
      name: userName.value,
      email: email.value,
      password: password.value,
    });
    if (result.success) {
      console.log('註冊成功:', result);

      router.push({ name: 'login', state: { msg: '註冊成功！前往登入' } });
    } else {
      console.log('登入失敗:', result);
      // errorMessage.value = result.error || '登入失敗';
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : '發生未知錯誤';
    errorMessage.value = error;
  }
};
</script>

<style scoped>
.v-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>
