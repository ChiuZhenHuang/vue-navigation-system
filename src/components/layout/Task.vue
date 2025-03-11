<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-center align-center">
          <v-progress-circular
            :model-value="finalPercent"
            :rotate="180"
            :size="150"
            :width="15"
            color="primary"
          >
            <div class="d-flex flex-column justify-center align-center">
              <p class="text-h6">{{ finalPercent }}%</p>
              <p>完成進度</p>
            </div>
          </v-progress-circular>
        </div>
      </v-col>

      <v-col cols="12">
        <v-sheet class="pa-4 mx-auto" color="blue-darken-2 elevation-16" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <p class="text-h6 mb-4">{{ taskOptions[0].title }}</p>
            <p>
              {{ formatToThousand(String(totalRecord?.totalDistance)) }} /
              {{ formatToThousand(taskOptions[0].target) }} km
            </p>
          </div>
          <div class="d-flex align-center">
            <v-progress-linear
              class="flex-grow-1"
              bg-color="grey-lighten-5"
              color="rgba(255, 255, 255, 0.7)"
              height="12"
              :model-value="percentProgress?.distance"
              rounded
            ></v-progress-linear>
            <div class="ms-4 text-h6">{{ percentProgress?.distance }}%</div>
          </div>
          <v-btn color="white" variant="outlined" class="text-white mt-2">
            <v-icon start icon="mdi-star" class="me-1"></v-icon>
            {{ formatToThousand(taskOptions[0].point) }}積分
          </v-btn>
        </v-sheet>
      </v-col>

      <v-col cols="12">
        <v-sheet class="pa-4 mx-auto" color="blue-darken-2 elevation-16" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <p class="text-h6 mb-4">{{ taskOptions[1].title }}</p>
            <p>{{ totalRecord?.totalCount }} / {{ taskOptions[1].target }}次</p>
          </div>
          <div class="d-flex align-center">
            <v-progress-linear
              class="flex-grow-1"
              bg-color="grey-lighten-5"
              color="rgba(255, 255, 255, 0.7)"
              height="12"
              :model-value="percentProgress?.count"
              rounded
            ></v-progress-linear>
            <div class="ms-4 text-h6">{{ percentProgress?.count }}%</div>
          </div>
          <v-btn color="white" variant="outlined" class="text-white mt-2">
            <v-icon start icon="mdi-star" class="me-1"></v-icon>
            {{ formatToThousand(taskOptions[1].point) }}積分
          </v-btn>
        </v-sheet>
      </v-col>

      <v-col cols="12">
        <v-sheet class="pa-4 mx-auto" color="blue-darken-2 elevation-16" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <p class="text-h6 mb-4">{{ taskOptions[2].title }}</p>
            <p>
              {{ formatToThousand(String(totalRecord?.totalOil)) }} /
              {{ formatToThousand(taskOptions[2].target) }}元
            </p>
          </div>
          <div class="d-flex align-center">
            <v-progress-linear
              class="flex-grow-1"
              bg-color="grey-lighten-5"
              color="rgba(255, 255, 255, 0.7)"
              height="12"
              :model-value="percentProgress?.oil"
              rounded
            ></v-progress-linear>
            <div class="ms-4 text-h6">{{ percentProgress?.oil }}%</div>
          </div>
          <v-btn color="white" variant="outlined" class="text-white mt-2">
            <v-icon start icon="mdi-star" class="me-1"></v-icon>
            {{ formatToThousand(taskOptions[2].point) }}積分
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card
          class="py-4 text-center d-flex flex-column bg-blue-darken-4 rounded-lg elevation-16"
        >
          <v-card-title
            class="text-slate-600 font-weight-bold text-h6 d-flex justify-center align-center py-2"
          >
            <v-icon icon="mdi-crown" class="mr-2" color="amber"></v-icon>
            本週成就
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="4" class="d-flex justify-center">
                <div>
                  <div class="text-slate-500">完成任務</div>
                  <div class="text-white font-weight-bold text-h6">
                    {{ overachievedCount }} / {{ taskOptions.length }}
                  </div>
                </div>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <div>
                  <div class="text-slate-500">累計里程</div>
                  <div class="text-white font-weight-bold text-h6">
                    {{ totalRecord && formatToThousand(totalRecord?.totalDistance) }}
                    km
                  </div>
                </div>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <div>
                  <div class="text-slate-500">總任務積分</div>
                  <div
                    class="text-white font-weight-bold text-h6 d-flex justify-center align-center"
                  >
                    <v-icon icon="mdi-trophy" class="mr-2" color="amber"></v-icon>
                    {{ formatToThousand(totalPoints) }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUserRecordStore } from '@/stores/userRecordStore';
import {
  calculateOilMoney,
  calculateTotalPoints,
  formatToThousand,
  taskOptions,
} from '@/utils/methods';

import type { TotalRecord, TaskProgress } from '@/types/recordType';
const userRecordStore = useUserRecordStore();

const finalPercent = ref(0); // 總進度百分比
const overachievedCount = ref(0); // 幾個達到目標
const totalPoints = ref(0); // 總積分
const totalRecord = ref<TotalRecord | null>(null); // 所有里程/油耗/次數(不超過目標)
const percentProgress = ref<TaskProgress | null>(null); // 各別的里程/油耗/次數百分比

// 計算里程/油耗/次數
watch(
  userRecordStore.userRecord,
  () => {
    const recordsArr = userRecordStore.userRecord?.records
      ? userRecordStore.userRecord.records
      : [];

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const filteredWeek = recordsArr.filter(item => item.timestamp >= oneWeekAgo);

    const transformedRecords = filteredWeek.map(item => {
      const totalDistance = Number(item.action.distance.split(' 公里')[0]);
      const totalOil = calculateOilMoney(totalDistance, item.action.oil);
      return { totalDistance, totalCount: filteredWeek.length, totalOil };
    });
    const totalSummary = transformedRecords.reduce(
      (acc, record) => {
        acc.totalDistance += record.totalDistance;
        acc.totalOil += record.totalOil;
        return acc;
      },
      { totalDistance: 0, totalOil: 0 }
    );

    totalRecord.value = {
      totalDistance: Math.min(
        Number(totalSummary.totalDistance),
        Number(taskOptions[0].target)
      ).toFixed(1),
      totalCount: Math.min(Number(filteredWeek.length), Number(taskOptions[1].target)).toFixed(0),
      totalOil: Math.min(Number(totalSummary.totalOil), Number(taskOptions[2].target)).toFixed(0),
    };
  },
  { immediate: true }
);

watch(
  () => totalRecord.value,
  () => {
    if (!totalRecord.value) return;

    const {
      totalPoints: calculatedPoints,
      overachievedCount: achievedCount,
      percentDistance,
      percentCount,
      percentOil,
    } = calculateTotalPoints(
      Number(totalRecord.value.totalDistance),
      Number(totalRecord.value.totalCount),
      Number(totalRecord.value.totalOil)
    );

    percentProgress.value = {
      distance: percentDistance.toFixed(0),
      count: percentCount.toFixed(0),
      oil: percentOil.toFixed(0),
    };

    // 計算最終平均百分比
    const averagePercent = Math.floor((percentDistance + percentCount + percentOil) / 3);
    totalPoints.value = calculatedPoints;
    overachievedCount.value = achievedCount;
    finalPercent.value = averagePercent;
  },
  { immediate: true }
);
</script>
