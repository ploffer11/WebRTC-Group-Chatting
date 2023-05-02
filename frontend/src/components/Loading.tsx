import { CircularProgress, Container, Stack, Typography } from '@mui/material';

const Loading = () => {
  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
      <Stack
        spacing={2}
        alignItems={'center'}
        justifyContent={'center'}
        height={'100vh'}
      >
        <CircularProgress />
        <Typography variant={'h4'}>Loading...</Typography>
      </Stack>
    </Container>
  );
};

export default Loading;
