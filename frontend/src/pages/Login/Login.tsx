import React, { useCallback, useState } from 'react';

import ForumRounded from '@mui/icons-material/ForumRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';

import { login } from '../../api/api.ts';

const Login = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  // TODO: 자동 로그인 연동
  const [enableAutoLogin, setEnableAutoLogin] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      switch (data.status) {
        case 200: // OK
        case 201: // Create
          // TODO: save access_token and redirect
          // const access_token = data.body.access_token;
          break;
        case 401: // Unauthorized
          setIdError('아이디 또는 비밀번호가 일치하지 않습니다.');
          setPwError('아이디 또는 비밀번호가 일치하지 않습니다.');
          break;
        default: // Something else...
          // TODO: other error handling
          break;
      }
    },
    onError: () => {
      // TODO: something else
      console.log('Login failed...');
    },
  });

  const tryLogin = useCallback(() => {
    let isOk = true;
    if (id.length < 1) {
      isOk = false;
      setIdError('아이디를 입력해 주세요.');
    } else {
      setIdError(null);
    }

    if (pw.length < 1) {
      isOk = false;
      setPwError('비밀번호를 입력해 주세요.');
    } else {
      setPwError(null);
    }

    if (!isOk) {
      return;
    }

    setIdError(null);
    setPwError(null);

    loginMutation.mutate({ username: id, password: pw });
  }, [id, pw, loginMutation]);

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
            disabled={loginMutation.isLoading}
            error={idError !== null}
            helperText={idError ?? ''}
          />
          <TextField
            type={'password'}
            label={'비밀번호'}
            value={pw}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPw(event.target.value);
            }}
            disabled={loginMutation.isLoading}
            error={pwError !== null}
            helperText={pwError ?? ''}
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

        <Button
          variant={'contained'}
          size={'large'}
          onClick={tryLogin}
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
