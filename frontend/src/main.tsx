import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import Base from './Base.tsx';
import Login from './pages/Login/Login.tsx';
import Main from './pages/Main/Main.tsx';

import './fonts.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Base />,
    children: [
      {
        index: true,
        loader: async () => {
          // TODO: check login state
          return redirect('login');
        },
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'main',
        loader: async () => {
          // TODO: check login state. if not logged in, then redirect to login page
          return null;
        },
        element: <Main />,
      },
    ],
  },
]);

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
