import React from 'react';
import ReactDOM from 'react-dom/client';

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import Base from './Base.tsx';
import Loading from './components/Loading.tsx';
import Chat from './pages/Chat/Chat.tsx';
import Login from './pages/Login/Login.tsx';
import Main from './pages/Main/Main.tsx';
import SignUp from './pages/SignUp/SignUp.tsx';
import {
  AuthRequiredRoute,
  IndexRoute,
  NoAuthRequiredRoute,
} from './routes.ts';

import './fonts.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={'/'} element={<Base />}>
      <Route index {...IndexRoute} element={<Loading />} />
      <Route path={'login'} element={<Login />} />
      <Route path={'signup'} element={<SignUp />} {...NoAuthRequiredRoute} />
      <Route path={'chat'} element={<Chat />} {...AuthRequiredRoute} />
      <Route path={'main'} element={<Main />} {...AuthRequiredRoute} />
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
