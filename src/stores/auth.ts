import { defineStore } from 'pinia';
import { getToken } from 'src/api/api';
import type GetTokenInterface from 'src/api/dto/getToken.interface';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as GetTokenInterface | null,
    appId: 0,
  }),
  actions: {
    async fetchToken(credentials: GetTokenInterface): Promise<void> {
      try {
        const token = await getToken(credentials);
        this.token = token;
        this.user = credentials;
        this.appId = credentials.appId;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(credentials));
        localStorage.setItem('app_id', credentials.appId.toString());
      } catch (error) {
        console.error('Token fetch failed:', error);
        throw error;
      }
    },
    loadTokenFromStorage() {
      // const token = this.token || localStorage.getItem('auth_token');
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }

      return token;
    },

    getAppId() {
      if (this.appId) {
        return this.appId;
      }

      const appId = localStorage.getItem('app_id', );

      if (!appId) return null;

      this.appId = +appId;

      return +appId;
    },

    getUserData() {
      if (this.user) {
        return this.user;
      }

      const raw = localStorage.getItem('user_data');
      if (!raw) return null;

      const userData = JSON.parse(raw) as GetTokenInterface;
      this.user = userData;

      return userData;
    },

    logout() {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('app_id');
      localStorage.removeItem('user_data');
    },
  },
});
