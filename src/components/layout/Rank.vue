<template>
  <v-container>
    <v-tabs v-model="currentPage" bg-color="primary" fixed-tabs dark>
      <v-tab v-for="(item, index) in tabItems" :key="index" :value="index">
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-list>
      <v-list-item
        v-for="(item, index) in paginatedData"
        :key="index"
        class="border-b-sm border-primary my-4"
      >
        <div class="d-flex align-center h-20">
          <v-list-item-avatar class="w-10 h-10">
            <v-avatar :color="getAvatarColor(index + 1)" class="white--text font-weight-bold">
              {{ getDisplayIndex(index + 1) }}
            </v-avatar>
          </v-list-item-avatar>

          <div class="ml-8">
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ getDescription(item) }}
            </v-list-item-subtitle>
          </div>
        </div>
      </v-list-item>
    </v-list>

    <v-pagination v-model="navigationPage" :length="totalPages" :total-visible="5"></v-pagination>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import {
  formatToThousand,
  formatTime,
  calculateTotalPoints,
  calculateOilMoney,
} from '@/utils/methods';
import type { TotalUserDataRecord } from '@/types/recordType';
import type { totalRecords, ActionResponse } from '@/types/recordType';

const userStore = useUserStore();

const userTotalData = computed(() => userStore.totalUserData);
const currentPage = ref(0); // 所在頁面
const navigationPage = ref(1); // 當前頁數
const nameData = ref<totalRecords[]>([]); // 所有資料
const sortedData = ref<totalRecords[]>([]); // 排序後資料

const tabItems = ['總里程排行', '總時間排行', '總油費排行', '總次數排行', '積分排行'];

watch(
  userTotalData,
  () => {
    nameData.value = userTotalData.value.map((item: TotalUserDataRecord) => {
      if (!item.id) {
        item.id = '';
      }
      if (!item.records) {
        item.records = [];
      }

      let totalDistance = 0;
      let totalTime = 0;
      let totalOil = 0;
      let totalCount = item.records.length;

      item.records.forEach((rec: ActionResponse) => {
        const distance = parseFloat(rec.action.distance.replace(/\s公里\s/g, '')) || 0;
        totalDistance += distance;

        let time = rec.action.time;
        const hourMatch = time.match(/(\d+)\s小時/);
        const minuteMatch = time.match(/(\d+)\s分鐘/);
        const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
        const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
        totalTime += hours * 60 + minutes;
        totalOil += calculateOilMoney(distance, rec.action.oil);
      });

      // 另外計算 "每週積分" 過濾近一星期
      const weekAge = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekRecords = item.records.filter((rec: ActionResponse) => rec.timestamp >= weekAge);
      const weekDistance = weekRecords.reduce(
        (sum, rec) => sum + parseFloat(rec.action.distance.replace(/\s公里\s/g, '')),
        0
      );
      const weekCount = weekRecords.length;
      const weekOil = weekRecords.reduce((sum, rec) => {
        const distance = parseFloat(rec.action.distance.replace(/\s公里\s/g, '')) || 0;
        return sum + calculateOilMoney(distance, rec.action.oil);
      }, 0);
      const { totalPoints } = calculateTotalPoints(weekDistance, weekCount, weekOil);

      return {
        ...item,
        id: item.id,
        records: item.records,
        totalDistance,
        totalTime,
        totalOil,
        totalCount,
        totalPoints,
      };
    });
  },
  { immediate: true }
);

watch(
  [currentPage, nameData],
  () => {
    sortedData.value = [...nameData.value].sort((a, b) => {
      switch (tabItems[currentPage.value]) {
        case '總里程排行':
          return b.totalDistance - a.totalDistance;
        case '總時間排行':
          return b.totalTime - a.totalTime;
        case '總油費排行':
          return b.totalOil - a.totalOil;
        case '總次數排行':
          return b.totalCount - a.totalCount;
        case '積分排行':
          return b.totalPoints - a.totalPoints;
        default:
          return 0;
      }
    });
  },
  { immediate: true }
);

// 總頁數
const totalPages = computed(() => Math.ceil(sortedData.value.length / 10));

// 每頁顯示的資料
const paginatedData = computed(() => {
  const start = (navigationPage.value - 1) * 10;
  return sortedData.value.slice(start, start + 10);
});

// 顯示的排名
const getDisplayIndex = (index: number) => (navigationPage.value - 1) * 10 + index;

// 排名的顏色
const getAvatarColor = (index: number) => {
  const actualIndex = getDisplayIndex(index);
  switch (actualIndex) {
    case 1:
      return 'yellow darken-2';
    case 2:
      return 'grey darken-2 text-black';
    case 3:
      return 'amber darken-2';
    default:
      return 'grey lighten-3';
  }
};

// 描述細項
const getDescription = (item: totalRecords) => {
  switch (tabItems[currentPage.value]) {
    case '總里程排行':
      return `總里程：${formatToThousand(item.totalDistance.toFixed(1))} km`;
    case '總時間排行':
      return `總時間：${formatTime(item.totalTime)}`;
    case '總油費排行':
      return `總油費：${formatToThousand(item.totalOil.toFixed(0))} 元`;
    case '總次數排行':
      return `總次數：${formatToThousand(item.totalCount)} 次`;
    case '積分排行':
      return `週積分：${formatToThousand(item.totalPoints)} 分`;
    default:
      return '';
  }
};
</script>
