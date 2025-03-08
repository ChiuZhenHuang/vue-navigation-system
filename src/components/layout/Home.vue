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

<script setup>
import Maps from './Maps.vue';
import { ref, onMounted } from 'vue';
import { getCarTypes } from '@/services/firebaseService';
import { getCookie } from '@/utils/methods';

onMounted(() => {
  getCarTypesData();
  const retrievedUid = getCookie('uid') ?? '';
  userId.value = retrievedUid;
});

const carItems = ref([]); // 車款列表
const userId = ref(null); // 用戶ID
const selectedCar = ref(null); // 被選擇車款

const getCarTypesData = async () => {
  const carTypes = await getCarTypes();
  carItems.value = carTypes.map(carType => carType.carType);
};
console.log(carItems.value);

const handleSelection = value => {
  console.log('Selected car:', value);
};
</script>
