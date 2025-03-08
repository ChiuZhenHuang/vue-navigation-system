import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    email: '',
    userName: '',
  }),
  actions: {
    setUserInfo(email: string, userName: string) {
      this.email = email;
      this.userName = userName;
    },
  },
});
