<template>
  <div class="mx-6 mt-6">
    <v-select
      label="選擇您的車款"
      :items="carItems"
      variant="outlined"
      v-model="selectedCar"
      @update:model-value="handleSelection"
    ></v-select>
  </div>

  <Maps v-if="userId" :user-id="userId" :select-car-type="selectedCar" />
</template>

<script setup lang="ts">
import Maps from './Maps.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { getCookie } from '@/utils/methods';
import { useCarTypeStore } from '@/stores/carTypeStor';

const carTypeStore = useCarTypeStore();
const userId = ref<string | null>(null);
const selectedCar = ref<string | null>(null);

// 移除原本的 carItems ref，改用 computed 從 store 獲取數據
const carItems = computed(() => carTypeStore.carType.map(carType => carType.carType));

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
  // 在組件掛載時獲取車型數據
  carTypeStore.getCarTypeApi();
  const retrievedUid = getCookie('uid') ?? '';
  userId.value = retrievedUid;
});

const handleSelection = (value: string) => {
  console.log('Selected car:', value);
  selectedCar.value = value;
};
</script>
