import { create } from 'zustand';

import { IAuthResult } from '@schema/auth';

import { profile } from '../api/auth';

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
  validate: () => Promise<boolean>;
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

  /**
   * Validate session and clears access token if invalid.
   *
   * @returns true if valid session
   */
  validate: async () => {
    // GET /auth/profile to check if this access token is valid
    // Every api call uses access token of this store, so this request can validate token enough.

    const validateResult = await profile();

    if (validateResult.status >= 300 || !validateResult.body.username) {
      set({ access_token: '' });
      throw new Error('User validation failed');
    }

    return true;
  },
}));

export default useAuthStore;
