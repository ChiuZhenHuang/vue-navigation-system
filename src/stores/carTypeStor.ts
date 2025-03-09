import { defineStore } from 'pinia';
import { getCarTypes } from '@/services/firebaseService';
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
  },
});
