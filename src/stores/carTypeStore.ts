import { defineStore } from 'pinia';
import { getCarTypes, updateCarTypes, addCarTypes } from '@/services/firebaseService';
import type { CarTypes } from '@/types/carTypes';

export const useCarTypeStore = defineStore('carType', {
  state: () => ({
    carType: [] as CarTypes[],
  }),
  actions: {
    async getCarTypeApi() {
      const carType = await getCarTypes();
      console.log('所有車款', carType);
      this.carType = carType;
    },
    async updateCarTypeApi(carType: string, oil: string) {
      const { success } = await updateCarTypes({ carType, oil });
      return success;
    },
    async addCarTypeApi(carType: string, oil: string) {
      const { success } = await addCarTypes({ carType, oil });
      return success;
    },
  },
});
