<template>
  <v-container v-if="!userRecordData?.records">
    <div class="d-flex align-center justify-center">
      <v-progress-circular indeterminate size="40" width="2" color="white" />
    </div>
  </v-container>

  <v-container v-else>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-center align-center">
          <v-progress-circular
            :model-value="finalPercent"
            :rotate="180"
            :size="150"
            :width="15"
            color="orange"
          >
            <div class="d-flex flex-column justify-center align-center">
              <p class="text-h6 text-black font-weight-bold">{{ finalPercent }}%</p>
              <p class="text-black font-weight-bold">完成進度</p>
            </div>
          </v-progress-circular>
        </div>
      </v-col>

      <v-col v-for="(item, index) in progressItems" :key="index" cols="12">
        <v-sheet class="pa-4 mx-auto" color="orange-lighten-4 elevation-10" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <p class="text-subtitle-1 mb-4 font-weight-bold">{{ item.title }}</p>
            <p>{{ item.current }} / {{ item.target }} {{ item.unit }}</p>
          </div>
          <div class="d-flex align-center">
            <v-progress-linear
              class="flex-grow-1"
              bg-color="deep-grey"
              color="orange"
              height="12"
              :model-value="item.percent"
              rounded
            />
            <div class="ms-4 text-h6">{{ item.percent }}%</div>
          </div>

          <Button
            color="white"
            variant="outlined"
            class="text-subtitle-1 mb-4 font-weight-bold mt-2 bg-orange-lighten-2 rounded-lg"
          >
            <v-icon start icon="mdi-star" class="me-1" />
            {{ formatToThousand(item.point) }}積分
          </Button>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <Card
          class="py-4 text-center d-flex flex-column bg-orange-lighten-4 rounded-lg elevation-10"
        >
          <template #title>
            <div
              class="text-slate-600 font-weight-bold text-h6 d-flex justify-center align-center py-2"
            >
              <v-icon icon="mdi-crown" class="mr-2" color="amber"></v-icon>
              本週成就
            </div>
          </template>

          <template #content>
            <v-row>
              <v-col cols="4" class="d-flex justify-center">
                <div>
                  <div class="text-slate-500 text-subtitle-1 font-weight-bold">完成任務</div>
                  <div class="text-orange-lighten-1 font-weight-bold text-h6">
                    {{ overachievedCount }} / {{ taskOptions.length }}
                  </div>
                </div>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <div>
                  <div class="text-slate-500 text-subtitle-1 font-weight-bold">累計里程</div>
                  <div class="text-orange-lighten-1 font-weight-bold text-h6">
                    {{ totalRecord && formatToThousand(totalRecord?.totalDistance) }}
                    km
                  </div>
                </div>
              </v-col>
              <v-col cols="4" class="d-flex justify-center">
                <div>
                  <div class="text-slate-500 text-subtitle-1 font-weight-bold">總任務積分</div>
                  <div
                    class="text-orange-lighten-1 font-weight-bold text-h6 d-flex justify-center align-center"
                  >
                    <v-icon icon="mdi-trophy" class="mr-2" color="amber"></v-icon>
                    {{ formatToThousand(totalPoints) }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </template>
        </Card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useUserRecordStore } from '@/stores/userRecordStore';
import {
  calculateOilMoney,
  calculateTotalPoints,
  formatToThousand,
  taskOptions,
} from '@/utils/methods';
import Button from '@/components/ui/Button.vue';
import type { TotalRecord, PercentProgress, TaskProgress } from '@/types/recordType';
import Card from '@/components/ui/Card.vue';

const userRecordStore = useUserRecordStore();

const userRecordData = computed(() => userRecordStore.userRecord);

const finalPercent = ref(0); // 總進度百分比
const overachievedCount = ref(0); // 幾個達到目標
const totalPoints = ref(0); // 總積分
const totalRecord = ref<TotalRecord | null>(null); // 所有里程/油耗/次數(不超過目標)
const percentProgress = ref<PercentProgress | null>(null); // 各別的里程/油耗/次數百分比

// 計算里程/油耗/次數
watch(
  userRecordData,
  () => {
    const recordsArr = userRecordData.value?.records ? userRecordData.value.records : [];

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

// 最後產出各別任務的所有資料
const progressItems = computed<TaskProgress[]>(() => {
  return [
    {
      title: taskOptions[0].title,
      current: totalRecord.value ? formatToThousand(String(totalRecord.value.totalDistance)) : '0',
      target: formatToThousand(taskOptions[0].target),
      unit: 'km',
      percent: percentProgress.value?.distance || '0',
      point: taskOptions[0].point,
    },
    {
      title: taskOptions[1].title,
      current: totalRecord.value?.totalCount || '0',
      target: taskOptions[1].target,
      unit: '次',
      percent: percentProgress.value?.count || '0',
      point: taskOptions[1].point,
    },
    {
      title: taskOptions[2].title,
      current: totalRecord.value ? formatToThousand(String(totalRecord.value.totalOil)) : '0',
      target: formatToThousand(taskOptions[2].target),
      unit: '元',
      percent: percentProgress.value?.oil || '0',
      point: taskOptions[2].point,
    },
  ];
});
</script>
