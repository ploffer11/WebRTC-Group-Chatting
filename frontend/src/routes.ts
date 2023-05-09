import { redirect } from 'react-router-dom';

import useAuthStore from './store/auth.ts';

const simpleSessionValidator =
  (requiresAuth = false, requiresNoAuth = false) =>
  async () => {
    const { access_token } = useAuthStore.getState();
    const isSessionValid = access_token !== '';

    if (!isSessionValid && requiresAuth) {
      return redirect('/login');
    }
    if (isSessionValid && requiresNoAuth) {
      return redirect('/main');
    }

    return null;
  };

const AuthRequiredHandle = { redirectIfNoAuth: '/login' };
const NoAuthRequiredHandle = { redirectIfAuth: '/main' };
const IndexHandle = { ...AuthRequiredHandle, ...NoAuthRequiredHandle };

export const AuthRequiredRoute = {
  handle: AuthRequiredHandle,
  loader: simpleSessionValidator(true, false),
};

export const NoAuthRequiredRoute = {
  handle: NoAuthRequiredHandle,
  loader: simpleSessionValidator(false, true),
};

export const IndexRoute = {
  handle: IndexHandle,
};
