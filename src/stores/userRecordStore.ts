import { defineStore } from 'pinia';
import type { TotalUserDataRecord } from '@/types/recordType';
import { getUserRecords } from '@/services/firebaseService';

export const useUserRecordStore = defineStore('userRecord', {
  state: () => ({
    userRecord: {} as TotalUserDataRecord,
  }),
  actions: {
    async getUserRecordApi(uid: string) {
      const userRecord = await getUserRecords(uid);
      console.log('本使用者紀錄', userRecord);
      this.userRecord = {
        ...userRecord,
        id: uid,
      };
    },
  },
});
