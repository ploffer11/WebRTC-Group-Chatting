import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import Base from './Base.tsx';
import Login from './pages/Login/Login.tsx';

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>,
);
