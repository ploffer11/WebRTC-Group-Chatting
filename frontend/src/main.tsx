import React from 'react';
import ReactDOM from 'react-dom/client';

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
  Route,
  RouterProvider,
} from 'react-router-dom';

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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={'/'} element={<Base />}>
      <Route index loader={simpleSessionValidator(true)} />
      <Route path={'login'} element={<Login />} />
      <Route path={'signup'} element={<Login />} />
      <Route
        path={'main'}
        element={<Main />}
        loader={simpleSessionValidator(true)}
        handle={{ requireAuth: true }}
      />
    </Route>,
  ),
);

const queryClient = new QueryClient();

// theme 선언을 따로 분리하는 게 깔끔할 수도?
const theme = createTheme({
  typography: {
    fontFamily: ['roboto', '"Noto Sans KR"', 'Arial', 'sans-serif'].join(','),
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
