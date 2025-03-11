import { defineStore } from 'pinia';
import { getUsersData } from '@/services/firebaseService';
import type { TotalUserDataRecord } from '@/types/recordType';

export const useUserStore = defineStore('user', {
  state: () => ({
    totalUserData: [] as TotalUserDataRecord[],
    userName: '',
  }),
  actions: {
    async getUserDataApi() {
      const userData = await getUsersData();
      console.log('所有使用者資料(含紀錄)', userData);
      this.totalUserData = userData;
    },
    setUserName(name: string) {
      this.userName = name;
    },
  },
});
