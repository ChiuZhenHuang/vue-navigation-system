<template>
  <ToastMessage />
  <v-app>
    <!-- 頂部應用欄 -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="isMobile"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-end mr-2">
        <!-- 使用 v-menu 讓頭像顯示下拉選單 -->
        <v-menu v-model="menu" offset-y>
          <template v-slot:activator="{ props }">
            <div class="x-4 d-flex justify-end align-center">
              <v-toolbar-title class="mx-4 d-flex justify-end" v-if="!isMobile">
                <v-btn
                  color="white"
                  :variant="isActiveVariant('/layout/home')"
                  @click="navigateTo('/layout/home')"
                >
                  導航
                </v-btn>
                <v-btn
                  color="white"
                  :variant="isActiveVariant('/layout/task')"
                  @click="navigateTo('/layout/task')"
                >
                  每週任務
                </v-btn>
                <v-btn
                  color="white"
                  :variant="isActiveVariant('/layout/rank')"
                  @click="navigateTo('/layout/rank')"
                >
                  排行榜
                </v-btn>
                <v-btn
                  color="white"
                  :variant="isActiveVariant('/layout/user-info')"
                  @click="navigateTo('/layout/user-info')"
                >
                  個人資訊
                </v-btn>
              </v-toolbar-title>

              <v-avatar color="info" size="large" :="props">
                {{ firstName }}
              </v-avatar>
            </div>
          </template>

          <!-- 下拉菜單內容 -->
          <v-list>
            <v-list-item
              v-for="(item, index) in items"
              :key="index"
              @click="handleMenuClick(item?.title)"
            >
              <v-list-item-title>{{ item?.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list density="compact">
        <v-list-item
          v-for="(item, i) in menuItems"
          :key="i"
          :value="item"
          :color="isActive(item.route) ? 'rgba(0, 0, 0, 0.5)' : ''"
          @click="navigateTo(item.route)"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title v-text="item.title"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup lang="ts">
import router from '@/router';
import { ref, computed, onMounted, nextTick } from 'vue';
import ToastMessage from '../toastMessage.vue';
import { useNotificationStore } from '@/stores/notification';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useUserRecordStore } from '@/stores/userRecordStore';

const display = useDisplay();
const isMobile = display.smAndDown;
const route = useRoute();

const notification = useNotificationStore();
const userRecordStore = useUserRecordStore();
onMounted(() => {
  const msg = window.history.state?.msg as string;
  if (msg) {
    notification.show(msg, 'success', 3000);
  }
});

const firstName = computed(() =>
  userRecordStore.userRecord.name ? String(userRecordStore.userRecord.name)[0] : ''
);

const items = computed(() =>
  userRecordStore.userRecord.name === '管理員'
    ? [{ title: '車款設置' }, { title: '登出' }]
    : [{ title: '登出' }]
);

// 控制導航抽屜的顯示
const drawer = ref(false);
const menu = ref(false);

// 頁面導航選單項目
const menuItems = [
  { title: '導航', icon: 'mdi-home', route: '/layout/home' },
  { title: '每週任務', icon: 'mdi-calendar-check', route: '/layout/task' },
  { title: '排行榜', icon: 'mdi-trophy', route: '/layout/rank' },
  { title: '個人資訊', icon: 'mdi-account-circle', route: '/layout/user-info' },
  { title: '登出', icon: 'mdi-logout', route: '/login' },
];

const isActiveVariant = (route: string) => {
  const currentPath = router.currentRoute.value.path;
  return currentPath === route ? 'outlined' : 'text';
};

const isActive = (route: string) => {
  const currentPath = router.currentRoute.value.path;
  return currentPath === route;
};

// 跳轉方法
const navigateTo = async (path: string) => {
  if (path === '/login') handleMenuClick('登出');

  if (route.path === path) {
    // 方法 1：使用 replace
    await router.replace(path);
    // 或者強制重新加載組件
    nextTick(() => {
      // 觸發組件重新渲染
      router.go(0);
    });
  } else {
    await router.push(path);
  }
};

const handleMenuClick = (title: string) => {
  if (title === '登出') {
    document.cookie = 'token=; max-age=0; path=/;';
    document.cookie = 'uid=; max-age=0; path=/;';
    router.replace({ name: 'login', state: { msg: '登出成功！' } });
    console.log('跳轉到登出頁面');
  } else if (title === '車款設置') {
    console.log('跳轉到車款設置');
    // 跳轉到車款設置頁面
  }
};
</script>

<style scoped>
.v-application {
  height: 64px; /* 讓頁面最小高度為螢幕高度 */
}
</style>
