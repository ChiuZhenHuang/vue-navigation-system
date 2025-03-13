<template>
  <div class="mx-4">
    <div class="mb-4">
      歡迎 <span class="user-name">{{ userName }}</span> 回來！
    </div>
    <v-select
      label="選擇您的車款"
      :items="carItems"
      variant="outlined"
      v-model="selectedCar"
      @update:model-value="handleSelection"
    />
  </div>

  <Maps
    v-show="isLoaded"
    :user-id="userId"
    :select-car-type="selectedCar"
    @loading-status="handleLoadingStatus"
  />
  <p v-if="!isLoaded">載入地圖中...</p>
</template>

<script setup lang="ts">
import Maps from './Maps.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { getCookie } from '@/utils/methods';
import { useCarTypeStore } from '@/stores/carTypeStore';
import { useUserRecordStore } from '@/stores/userRecordStore';

const userRecordStore = useUserRecordStore();
const carTypeStore = useCarTypeStore();
const userId = ref<string>('');
const selectedCar = ref<string>('');
const isLoaded = ref(false);

const carItems = computed(() => carTypeStore.carType.map(carType => carType.carType));
const userName = computed(() => userRecordStore.userRecord.name);

watch(
  () => carTypeStore.carType,
  newValue => {
    if (newValue.length > 0 && !selectedCar.value) {
      selectedCar.value = newValue[0].carType;
    }
  },
  { immediate: true }
);

onMounted(() => {
  carTypeStore.getCarTypeApi();
  const retrievedUid = getCookie('uid') ?? '';
  userId.value = retrievedUid;
});

const handleSelection = (value: string) => {
  console.log('Selected car:', value);
  selectedCar.value = value;
};

const handleLoadingStatus = (status: boolean) => {
  isLoaded.value = status;
};
</script>

<style scoped>
.user-name {
  font-weight: bold;
  font-size: 18px;
  text-decoration: underline;
}
</style>
