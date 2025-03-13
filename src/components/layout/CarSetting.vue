<template>
  <v-container v-if="!getTotalCar.length">
    <div class="d-flex align-center justify-center">
      <v-progress-circular indeterminate size="40" width="2" color="white" />
    </div>
  </v-container>

  <v-container v-else>
    <Button
      @click="handleUpdateCarType"
      :disabled="!selectedCar"
      color="orange-lighten-4"
      class="mr-4"
      label="儲存"
    />

    <Button
      @click="handleAddCarType"
      :disabled="!!selectedCar"
      color="orange-lighten-4"
      class="mr-4"
      label="新增"
    />

    <Button
      @click="cancelAddCarType"
      v-if="newCarType"
      color="orange-darken-1"
      class="mr-4"
      label="取消"
    />

    <!-- 新增之車款 -->
    <div v-if="newCarType" :key="newCarType.carType">
      <v-responsive class="mx-auto mt-4 px-2 border-b-md border-black" width="100%">
        <v-row>
          <v-col cols="12" sm="6" class="my-2">
            <TextField v-model="tempCarType" label="車款" variant="outlined" />
          </v-col>
          <v-col cols="12" sm="6" class="my-2">
            <TextField v-model="tempOil" label="油耗" variant="outlined" type="number" min="0" />
          </v-col>
        </v-row>
      </v-responsive>
    </div>

    <!-- 現有車款 -->
    <div v-for="car in getTotalCar" :key="car.carType">
      <v-responsive class="mx-auto mt-4 px-2 border-b-md border-black" width="100%">
        <v-row>
          <v-col cols="12" sm="6" class="my-2">
            <TextField
              :model-value="car.carType"
              label="車款"
              readonly
              variant="outlined"
              :disabled="
                !!newCarType || (selectedCar !== null && selectedCar?.carType !== car.carType)
              "
            />
          </v-col>
          <v-col cols="12" sm="6" class="my-2">
            <TextField
              :model-value="selectedCar?.carType === car.carType ? selectedCar.oil : car.oil"
              label="油耗"
              type="number"
              variant="outlined"
              min="0"
              @update:model-value="updateCarOil(car, $event)"
              :disabled="
                !!newCarType || (selectedCar !== null && selectedCar?.carType !== car.carType)
              "
            />
          </v-col>
        </v-row>
      </v-responsive>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useCarTypeStore } from '@/stores/carTypeStore';
import { onMounted, ref, computed } from 'vue';
import type { CarTypes } from '@/types/carTypes';
import { useMessageStore } from '@/stores/messageStore';
import Button from '@/components/ui/Button.vue';
import TextField from '@/components/ui/TextField.vue';

const carTypeStore = useCarTypeStore();
const messageStore = useMessageStore();
const selectedCar = ref<CarTypes | null>(null); // 選擇欲更改油耗之車款
const newCarType = ref<CarTypes | null>(null); // 新增車款
const tempCarType = ref('');
const tempOil = ref('');

const getTotalCar = computed(() => carTypeStore.carType);
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
      messageStore.show('儲存成功', 'success', 3000);
      selectedCar.value = null;
    } else {
      messageStore.show('儲存失敗', 'error', 3000);
    }
  }
};

// 更新新增車款
const handleAddCarType = async () => {
  if (newCarType.value && (!tempCarType.value || !tempOil.value)) {
    messageStore.show('請完整輸入車款資訊', 'error', 3000);
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
      messageStore.show('新增成功', 'success', 3000);
      newCarType.value = null;
      tempCarType.value = '';
      tempOil.value = '';
    } else {
      messageStore.show('新增失敗', 'error', 3000);
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
