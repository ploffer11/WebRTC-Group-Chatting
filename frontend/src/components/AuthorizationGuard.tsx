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
  redirectIfAuth?: string;
  redirectIfNoAuth?: string;
};

const getRedirectLocation = (
  status: number,
  redirectIfAuth: string | undefined,
  redirectIfNoAuth: string | undefined,
) => {
  if (status < 300 && redirectIfAuth) {
    return redirectIfAuth;
  }

  if (status === 401 && redirectIfNoAuth) {
    return redirectIfNoAuth;
  }

  return null;
};

const AuthorizationGuard = ({
  errorFallback,
  loadingFallback,
  children,
}: React.PropsWithChildren<AuthorizationCheckParam>) => {
  const authStore = useAuthStore();

  const matches = useMatches();
  const navigate = useNavigate();

  const { redirectIfAuth, redirectIfNoAuth } = useMemo(
    () =>
      matches.reduce(
        (prevRequirements, { handle }) => ({
          ...prevRequirements,
          ...(handle as AuthorizationRequirements),
        }),
        {} as AuthorizationRequirements,
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
      const redirectLocation = getRedirectLocation(
        status,
        redirectIfAuth,
        redirectIfNoAuth,
      );

      if (status === 401) {
        authStore.invalidateSession();
      }

      if (redirectLocation) {
        navigate(redirectLocation, { replace: true });
      }
    },
  });

  // 데이터 로딩이 완료된 상황에서 곧 redirect 될 경우, 페이지 렌더링 방지
  if (data.status === 'success') {
    const willBeRedirect = !!getRedirectLocation(
      data.data.status,
      redirectIfAuth,
      redirectIfNoAuth,
    );

    if (willBeRedirect) {
      return <>{loadingFallback}</>;
    }
  }

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
