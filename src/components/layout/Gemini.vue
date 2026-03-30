<template>
  <!-- 浮動開啟按鈕 -->
  <v-btn v-if="!isOpen" icon class="chat-btn" @click="isOpen = true">
    <v-icon>mdi-robot</v-icon>
  </v-btn>

  <!-- 聊天卡片 -->
  <v-card v-if="isOpen" rounded="lg" class="chat-card" elevation="10">
    <!-- 標題 -->
    <v-card-title class="chat-header">
      <span>AI 聊天機器人</span>

      <!-- 關閉按鈕 -->
      <v-btn icon size="small" color="orange-darken-2" @click="isOpen = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <!-- 訊息區 -->
    <v-card-text class="chat-body my-2">
      <Flex vertical gap="middle">
        <Bubble.List
          :roles="roles"
          :items="
            messages.map(({ id, message, status }) => ({
              key: id,
              loading: status === 'loading',
              role: status === 'local' ? 'local' : 'ai',
              content: message,
            }))
          "
        />
      </Flex>
    </v-card-text>

    <v-card-actions>
      <Sender
        :loading="senderLoading"
        :value="content"
        :on-change="setContent"
        :on-submit="
          nextContent => {
            onRequest(nextContent);
            setContent('');
          }
        "
      />
    </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
import { UserOutlined, RobotOutlined } from '@ant-design/icons-vue';
import { Flex, message as AntMessage } from 'ant-design-vue';
import { Bubble, Sender, useXAgent, useXChat, type BubbleListProps } from 'ant-design-x-vue';
import { ref, h } from 'vue';

import { useUserStore } from '@/stores/userStore';
import { useUserRecordStore } from '@/stores/userRecordStore';
import { useCarTypeStore } from '@/stores/carTypeStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

defineOptions({ name: 'AIChat' });

const isOpen = ref(false);

// ===== store =====
const userStore = useUserStore();
const userRecordStore = useUserRecordStore();
const carTypeStore = useCarTypeStore();

// ===== Gemini =====
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_GOOGLE_GENERATIVE_AI_KEY);

// ===== UI 狀態 =====
const content = ref('');
const senderLoading = ref(false);

// ===== message API =====
const [messageApi] = AntMessage.useMessage();

// ===== Bubble roles =====
const roles: BubbleListProps['roles'] = {
  ai: {
    placement: 'start',
    avatar: { icon: h(RobotOutlined), style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: { maxWidth: '600px' },
  },
  local: {
    placement: 'end',
    avatar: { icon: h(UserOutlined), style: { background: '#87d068' } },
  },
};

// ===== Agent =====
const [agent] = useXAgent<string, { message: string }, string>({
  request: async ({ message }, { onSuccess, onError }) => {
    senderLoading.value = true;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const latestTotalData = userStore.totalUserData;
      const latestUserData = userRecordStore.userRecord;
      const latestUserName = userStore.userName;
      const latestCarTypes = carTypeStore.carType;

      const isDataReady = latestTotalData && latestUserData && latestUserName && latestCarTypes;

      if (!isDataReady) {
        messageApi.error('AI尚未取得資料，請稍後再試');
        onError(new Error('data not ready'));
        return;
      }

      const prompt = `
    以下是當前使用者的資訊：
    - 使用者名稱: ${latestUserName || '未知'}
    - 使用者駕駛記錄:
    ${JSON.stringify(latestUserData, null, 2)}
    
    以下是所有使用者資料：
    ${JSON.stringify(latestTotalData, null, 2)}
    
    以下是車輛類型資料：
    ${JSON.stringify(latestCarTypes, null, 2)}
    
    請根據以上資訊回答：
    ${message}
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 官方格式（array）
      onSuccess([text]);
    } catch (err) {
      console.error(err);
      messageApi.error('AI 回覆發生錯誤');
      onError(new Error('Gemini error'));
    } finally {
      senderLoading.value = false;
    }
  },
});

// ===== Chat =====
const { onRequest, messages } = useXChat({
  agent: agent.value,
  requestPlaceholder: 'AI 思考中...',
  requestFallback: '發送失敗，請稍後再試',
});

// ===== input control =====
const setContent = (v: string) => {
  content.value = v;
};
</script>

<style scoped>
.chat-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 90vw;
  max-width: 450px;
  height: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgb(255, 247, 237);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
}
</style>
