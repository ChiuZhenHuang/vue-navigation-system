<template>
  <v-container>
    <v-btn @click="handleUpdateCarType" :disabled="!selectedCar" class="mr-4">儲存</v-btn>
    <v-btn @click="handleAddCarType" :disabled="!!selectedCar" class="mr-4">新增</v-btn>
    <v-btn @click="cancelAddCarType" v-if="newCarType" class="mr-4">取消</v-btn>

    <!-- 新增之車款 -->
    <div v-if="newCarType" :key="newCarType.carType">
      <v-responsive class="mx-auto mt-4 px-2 border-b-md border-black" width="100%">
        <v-row>
          <v-col cols="12" sm="6" class="my-2">
            <v-text-field
              hide-details="auto"
              label="車款"
              v-model="tempCarType"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="my-2">
            <v-text-field
              hide-details="auto"
              label="油耗"
              v-model="tempOil"
              variant="outlined"
              type="number"
              min="0"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-responsive>
    </div>

    <!-- 現有車款 -->
    <div v-for="car in carTypeStore.carType" :key="car.carType">
      <v-responsive class="mx-auto mt-4 px-2 border-b-md border-black" width="100%">
        <v-row>
          <v-col cols="12" sm="6" class="my-2">
            <v-text-field
              hide-details="auto"
              label="車款"
              :model-value="car.carType"
              readonly
              :disabled="!!newCarType"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="my-2">
            <v-text-field
              hide-details="auto"
              label="油耗"
              :model-value="selectedCar?.carType === car.carType ? selectedCar.oil : car.oil"
              variant="outlined"
              type="number"
              min="0"
              @update:model-value="updateCarOil(car, $event)"
              :disabled="
                !!newCarType || (selectedCar !== null && selectedCar?.carType !== car.carType)
              "
            ></v-text-field>
          </v-col>
        </v-row>
      </v-responsive>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useCarTypeStore } from '@/stores/carTypeStore';
import { onMounted, ref } from 'vue';
import type { CarTypes } from '@/types/carTypes';
import { useNotificationStore } from '@/stores/notification';

const carTypeStore = useCarTypeStore();
const notification = useNotificationStore();
const selectedCar = ref<CarTypes | null>(null); // 選擇欲更改油耗之車款
const newCarType = ref<CarTypes | null>(null); // 新增車款
const tempCarType = ref('');
const tempOil = ref('');

// 改變油耗
const updateCarOil = (car: CarTypes, newOil: string) => {
  selectedCar.value = { ...car, oil: newOil };
};

// 更新油耗儲存
const handleUpdateCarType = async () => {
  if (selectedCar.value) {
    const result = await carTypeStore.updateCarTypeApi(
      selectedCar.value.carType,
      selectedCar.value.oil
    );
    if (result) {
      await carTypeStore.getCarTypeApi();
      notification.show('更新成功', 'success', 3000);
      selectedCar.value = null;
    } else {
      notification.show('更新失敗', 'error', 3000);
    }
  }
};

// 更新新增車款
const handleAddCarType = async () => {
  if (newCarType.value && (!tempCarType.value || !tempOil.value)) {
    notification.show('請完整輸入車款資訊', 'error', 3000);
    return;
  }
  // 如果沒有車款，就新增車款讓使用者填寫
  if (!newCarType.value) {
    newCarType.value = {
      carType: '',
      oil: '',
      value: '',
    };
    tempCarType.value = '';
    tempOil.value = '';
  } else if (tempCarType.value && tempOil.value) {
    // 如果已經填寫了資料，就進行新增
    console.log('車款', tempCarType.value);
    console.log('油耗', tempOil.value);

    const result = await carTypeStore.addCarTypeApi(tempCarType.value, tempOil.value);
    if (result) {
      await carTypeStore.getCarTypeApi();
      notification.show('新增成功', 'success', 3000);
      newCarType.value = null;
      tempCarType.value = '';
      tempOil.value = '';
    } else {
      notification.show('新增失敗', 'error', 3000);
    }
  }
};

// 取消新增車款
const cancelAddCarType = () => {
  newCarType.value = null;
  tempCarType.value = '';
  tempOil.value = '';
};

onMounted(() => {
  carTypeStore.getCarTypeApi();
});
</script>
