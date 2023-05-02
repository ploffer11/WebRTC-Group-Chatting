import { Container, Stack, Typography } from '@mui/material';

const ErrorMessage = () => {
  return (
    <Container
      maxWidth={'sm'}
      sx={{ display: 'flex', justifyContent: 'center' }}
    >
      <Stack
        spacing={2}
        alignItems={'center'}
        justifyContent={'center'}
        height={'100vh'}
      >
        <Typography variant={'h1'}>😢</Typography>
        <Typography variant={'h2'}>Oops!</Typography>
        <Typography variant={'h4'}>Something goes wrong...</Typography>
      </Stack>
    </Container>
  );
};

export default ErrorMessage;
