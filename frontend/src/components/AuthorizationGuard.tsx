import React, { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useMatches, useNavigate } from 'react-router-dom';

import apiRequest from '../api/index.ts';
import useAuthStore from '../store/auth.ts';

type AuthorizationCheckParam = {
  loadingFallback: React.ReactNode;
  errorFallback: React.ReactNode;
};

type AuthorizationRequirements = {
  requiresAuth: boolean;
  requiresNoAuth: boolean;
};

const AuthorizationGuard = ({
  errorFallback,
  loadingFallback,
  children,
}: React.PropsWithChildren<AuthorizationCheckParam>) => {
  const authStore = useAuthStore();

  const matches = useMatches();
  const navigate = useNavigate();

  const { requiresAuth, requiresNoAuth } = useMemo(
    () =>
      matches.reduce(
        (prevRequirements, { handle }) => ({
          ...prevRequirements,
          ...(handle as AuthorizationRequirements),
        }),
        {
          requiresAuth: false,
          requiresNoAuth: false,
        } as AuthorizationRequirements,
      ),
    [matches],
  );

  const data = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () =>
      apiRequest({
        method: 'get',
        url: '/auth/profile',
        validateStatus: () => true,
      }),
    retry: 0,
    cacheTime: 1000 * 60 * 60, // 임시로 1시간으로 지정
    onSuccess: ({ status }) => {
      // Validated
      if (status < 300) {
        if (!requiresNoAuth) {
          navigate('/main', { replace: true });
        }
      } else if (status === 401) {
        authStore.invalidateSession();
        if (requiresAuth) {
          navigate('/login', { replace: true });
        }
      }
    },
  });

  switch (data.status) {
    case 'error':
      return <>{errorFallback}</>;
    case 'loading':
      return <>{loadingFallback}</>;
    default:
      return <>{children}</>;
  }
};

export default AuthorizationGuard;
