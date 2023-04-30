import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import Base from './Base.tsx';
import Login from './pages/Login/Login.tsx';
import Main from './pages/Main/Main.tsx';
import useAuthStore from './store/auth.ts';

import './fonts.css';

const simpleSessionValidator = (shouldBeLogin: boolean) => async () => {
  const { access_token } = useAuthStore.getState();
  const isSessionValid = access_token !== '';

  if (shouldBeLogin) {
    if (!isSessionValid) return redirect('/login');
  } else {
    if (isSessionValid) return redirect('/main');
  }

  return null;
};

/**
 * index에서 /main으로 redirect 하는 이유:
 * /main으로 rediect 한 다음 => /main에서 다시 한 번 redirection 과정을 거칠 것이기 때문.
 * index만을 위해서 별도의 콜백을 만들어 주는 것보다는 이쪽이 더 예뻐보임.
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={'/'} element={<Base />}>
      <Route index loader={() => redirect('/main')} />
      <Route
        path={'login'}
        element={<Login />}
        loader={simpleSessionValidator(false)}
      />
      <Route
        path={'main'}
        element={<Main />}
        loader={simpleSessionValidator(true)}
      />
    </Route>,
  ),
);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>,
);
