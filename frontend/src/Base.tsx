import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { Outlet } from 'react-router-dom';

const theme = createTheme({
  typography: {
    fontFamily: ['roboto', '"Noto Sans KR"', 'Arial', 'sans-serif'].join(','),
  },
});

const Base = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  );
};

export default Base;
