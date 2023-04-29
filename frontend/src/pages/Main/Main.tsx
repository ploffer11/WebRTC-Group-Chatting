import { useEffect } from 'react';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const Main = () => {
  useEffect(() => {
    document.title = 'Main';
  }, []);

  return (
    <Container maxWidth="sm">
      <Stack sx={{ mt: 16 }} alignItems={'center'} spacing={2}>
        <Typography variant={'h1'}>🥳</Typography>
        <Typography variant={'h2'}>Congratulations!</Typography>
        <Typography variant={'h4'}>You successfully logged in!</Typography>
      </Stack>
    </Container>
  );
};

export default Main;
