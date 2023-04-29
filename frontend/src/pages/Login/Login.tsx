import React, { useState } from 'react';

import ForumRounded from '@mui/icons-material/ForumRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const Login = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [enableAutoLogin, setEnableAutoLogin] = useState(false);

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', my: 16 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            my: 4,
          }}
        >
          <ForumRounded sx={{ fontSize: 80 }} />
          <Typography variant={'h2'}>Group Chat</Typography>

          <Typography variant={'h4'} sx={{ mt: 4 }}>
            로그인
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField
            label={'아이디'}
            value={id}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setId(event.target.value);
            }}
          />
          <TextField
            type={'password'}
            label={'비밀번호'}
            value={pw}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPw(event.target.value);
            }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="자동 로그인"
            value={enableAutoLogin}
            onChange={(_event, checked) => {
              setEnableAutoLogin(checked);
            }}
          />
        </Stack>

        <Button variant={'contained'} size={'large'}>
          로그인
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
