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

import './fonts.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={'/'} element={<Base />}>
      <Route
        index
        loader={async () => {
          // TODO: if logged in, then redirect to main, else redirect to main
          return redirect('login');
        }}
      />
      <Route
        path={'login'}
        element={<Login />}
        loader={async () => {
          // TODO: if logged in, redirect to main
          return null;
        }}
      />
      <Route
        path={'main'}
        element={<Main />}
        loader={async () => {
          // TODO: if not logged in, redirect to login
          return null;
        }}
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
