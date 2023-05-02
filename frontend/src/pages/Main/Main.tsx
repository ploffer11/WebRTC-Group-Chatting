import { Container, Stack, Typography } from '@mui/material';

import useTitle from '../../hooks/useTitle.ts';

const Main = () => {
  useTitle('Main');

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
