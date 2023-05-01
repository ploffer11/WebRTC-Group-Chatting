import { create } from 'zustand';

import { IAuthResult } from '@schema/auth';

interface AuthStore extends IAuthResult {
  /**
   * Save the access token.
   * @details Save it to the store and session storage first.
   * If `persist` is `true`, save it to the local storage too.
   *
   * @param grantedToken access token granted
   * @param persist `true` if auto login is enabled.
   */
  setAccessToken: (grantedToken: string, persist: boolean) => void;
  invalidateSession: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  access_token:
    sessionStorage.getItem('access_token') ??
    localStorage.getItem('access_token') ??
    '',

  setAccessToken: (grantedToken: string, persist: boolean) => {
    set({ access_token: grantedToken });

    sessionStorage.setItem('access_token', grantedToken);

    if (persist) {
      localStorage.setItem('access_token', grantedToken);
    } else {
      localStorage.removeItem('access_token');
    }
  },

  invalidateSession: () => set({ access_token: '' }),
}));

export default useAuthStore;
