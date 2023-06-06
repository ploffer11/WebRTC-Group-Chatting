import React, { useCallback, useState } from 'react';

import ForumRounded from '@mui/icons-material/ForumRounded';
import {
  Box,
  Container,
  TextField,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ICreateUser, IAuthResult } from '@schema/auth';

import apiRequest from '../../api';
import useAuthStore from '../../store/auth.ts';

export default function SignUp() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const [pwFocusedBefore, setPwFocusedBefore] = useState(false);
  const [pwConfirmFocusedBefore, setPwConfirmFocusedBefore] = useState(false);

  const [pwConfirm, setPwConfirm] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwConfirmError, setPwConfirmError] = useState<string | null>(null);

  const navigate = useNavigate();
  const authStore = useAuthStore();
  const queryClient = useQueryClient();

  const signUpMutation = useMutation({
    mutationFn: (data: ICreateUser) =>
      apiRequest<IAuthResult>({
        method: 'post',
        url: '/auth/signup',
        validateStatus: () => true,
        data,
      }),
    onSuccess: ({ status, data }) => {
      switch (status) {
        case 200:
        case 201: // Created
          authStore.setAccessToken(data.access_token, false);

          queryClient
            .invalidateQueries({ queryKey: ['auth', 'profile'] })
            .then(() => {
              navigate('/chat');
            });
          break;
        case 409: // Duplicate
          setIdError('이미 사용 중인 아이디 입니다.');
          break;
        default: // Unknown Error
          // TODO: Error Handling
          break;
      }
    },
    onError: () => {
      // TODO: Error Handling
    },
  });

  const checkPwConfirm = useCallback(() => {
    if (!pwFocusedBefore || !pwConfirmFocusedBefore) {
      return;
    }

    if (pw !== pwConfirm) {
      setPwConfirmError('비밀번호가 일치하지 않습니다.');
    } else {
      setPwConfirmError(null);
    }
  }, [pw, pwConfirm, pwConfirmFocusedBefore, pwFocusedBefore]);

  const trySignUp = useCallback(() => {
    let isValid = true;
    if (id.length < 1) {
      isValid = false;
      setIdError('아이디를 입력해 주세요.');
    }

    if (pw.length < 1) {
      isValid = false;
      setPwError('비밀번호를 입력해 주세요.');
    }

    if (pw !== pwConfirm) {
      isValid = false;
      setPwConfirmError('비밀번호가 일치하지 않습니다.');
    }

    if (isValid) {
      setIdError(null);
      setPwError(null);
      setPwConfirmError(null);
      signUpMutation.mutate({ username: id, password: pw });
    }
  }, [id, pw, pwConfirm, signUpMutation]);

  return (
    <Container maxWidth={'sm'}>
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
        </Box>

        <Typography
          variant={'h4'}
          sx={{ my: 4, alignItems: 'center', textAlign: 'center' }}
        >
          회원가입
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField
            label={'아이디'}
            value={id}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setIdError(null);
              setId(event.target.value);
            }}
            disabled={signUpMutation.isLoading}
            error={idError !== null}
            helperText={idError ?? ''}
          />
          <TextField
            type={'password'}
            label={'비밀번호'}
            value={pw}
            onFocus={() => {
              setPwFocusedBefore(true);
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPwConfirmError(null);
              setPw(event.target.value);
            }}
            onBlur={checkPwConfirm}
            disabled={signUpMutation.isLoading}
            error={pwError !== null}
            helperText={pwError ?? ''}
          />
          <TextField
            type={'password'}
            label={'비밀번호 확인'}
            value={pwConfirm}
            onFocus={() => {
              setPwConfirmFocusedBefore(true);
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPwConfirmError(null);
              setPwConfirm(event.target.value);
            }}
            onBlur={checkPwConfirm}
            disabled={signUpMutation.isLoading}
            error={pwConfirmError !== null}
            helperText={pwConfirmError ?? ''}
          />
        </Stack>

        <Button variant={'contained'} size={'large'} onClick={trySignUp}>
          회원가입
        </Button>
      </Box>
    </Container>
  );
}
