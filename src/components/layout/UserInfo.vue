<template>
  <v-container v-if="!userRecord?.id">
    <div class="d-flex align-center justify-center">
      <v-progress-circular indeterminate size="40" width="2" color="white" />
    </div>
  </v-container>

  <v-container v-else>
    <v-row justify="center" align="center">
      <!-- Avatar 部分 -->
      <v-col cols="12" sm="8" class="d-flex justify-center align-center mt-2">
        <v-avatar size="100" class="border-md avatar">
          <span class="text-h3 font-weight-bold text-white">{{
            userRecord.name && String(userRecord.name)[0]
          }}</span>
        </v-avatar>
      </v-col>

      <!-- 使用者名稱部分 -->
      <v-col cols="12" sm="4" class="d-flex justify-center align-center">
        <div class="w-100">
          <div class="d-flex justify-center mt-2">
            <p class="font-weight-bold text-h5">{{ userRecord.name }}</p>
          </div>
        </div>
      </v-col>

      <!-- 導航紀錄部分 -->
      <v-col cols="12" class="d-flex justify-center align-center">
        <div class="w-100 flex-1">
          <v-divider class="mb-4" color="black" style="border-width: 1px"></v-divider>

          <p
            class="my-2 py-1 text-center rounded-lg text-white bg-orange-darken-2 font-weight-bold w-sm-auto"
          >
            導航紀錄
          </p>

          <div v-if="userRecord.records && userRecord.records.length > 0">
            <v-card
              v-for="(item, index) in userRecord.records"
              :key="index"
              :class="`my-2 ${index % 2 === 0 ? 'bg-orange-lighten-4' : 'bg-light-orange'}`"
            >
              <template v-slot:title>
                <span class="text-black font-weight-bold text-subtitle-1">{{
                  item.action.place
                }}</span>
              </template>
              <v-card-text>
                <p>距離：{{ item.action.distance }}</p>
                <p>花費時間：{{ item.action.time }}</p>
                <p>使用車種：{{ item.action.carType }}</p>
                <p>
                  預估油費：NT$
                  {{
                    formatToThousand(
                      calculateOilMoney(
                        item.action.distance.split(' 公里')[0],
                        item.action.oil
                      ).toFixed(0)
                    )
                  }}
                  元
                </p>
                <p class="text-grey-darken-1 text-caption">
                  {{ new Date(item.timestamp).toLocaleString() }}
                </p>
              </v-card-text>
            </v-card>
          </div>

          <div v-else class="d-flex flex-column align-center justify-center mt-6">
            <div class="my-6">您尚未有導航紀錄！</div>
            <v-btn
              class="mt-2 w-100 w-sm-auto"
              color="orange-lighten-4"
              @click="$router.push('/layout/home')"
            >
              開始導航
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { calculateOilMoney, formatToThousand } from '@/utils/methods';
import { useUserRecordStore } from '@/stores/userRecordStore';

const userRecordStore = useUserRecordStore();

const userRecord = computed(() => userRecordStore.userRecord);
</script>

<style scoped>
.v-container :deep(.w-sm-auto) {
  width: 160px !important;
}

@media (max-width: 600px) {
  .v-container :deep(.w-sm-auto) {
    width: 100% !important;
  }
}

.avatar {
  background-color: #afaaa0;
}

.bg-light-orange {
  background-color: rgb(255, 247, 237);
}
</style>
