import React, { useCallback, useState } from 'react';

import ForumRounded from '@mui/icons-material/ForumRounded';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { IUserCredentials } from '@schema/auth';

import apiRequest from '../../api/index.ts';
import useTitle from '../../hooks/useTitle.ts';
import useAuthStore from '../../store/auth.ts';

const Login = () => {
  useTitle('로그인');

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [enableAutoLogin, setEnableAutoLogin] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const navigate = useNavigate();
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  // useMutation() for login api

  const loginMutation = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: IUserCredentials) =>
      apiRequest({
        method: 'post',
        url: '/auth/login',
        data: credentials,
      }),
    onSuccess: ({ status, data }) => {
      switch (status) {
        case 200:
        case 201:
          // HTTP 200
          authStore.setAccessToken(data.access_token, enableAutoLogin);

          queryClient
            .invalidateQueries({ queryKey: ['auth', 'profile'] })
            .then(() => {
              navigate('/chat');
            });
          break;
        case 401:
          // HTTP 401
          setIdError('아이디 또는 비밀번호가 일치하지 않습니다.');
          setPwError('아이디 또는 비밀번호가 일치하지 않습니다.');
          break;
        default:
        // TODO: other error handling
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

        <Stack spacing={2} sx={{ mt: 8 }}>
          <Typography variant={'body1'} textAlign={'center'}>
            아직 계정이 없다면?
          </Typography>
          <Button
            component={Link}
            variant={'contained'}
            size={'large'}
            to={'/signup'}
          >
            회원가입
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
