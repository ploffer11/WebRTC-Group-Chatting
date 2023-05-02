import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { useMatches, useNavigate } from 'react-router-dom';

import { profile } from '../api/auth.ts';
import useAuthStore from '../store/auth.ts';

type AuthorizationCheckParam = {
  loadingFallback: React.ReactNode;
  errorFallback: React.ReactNode;
};

const AuthorizationGuard = (
  props: React.PropsWithChildren<AuthorizationCheckParam>,
) => {
  const authStore = useAuthStore();

  const matches = useMatches();
  const navigate = useNavigate();

  const data = useQuery({
    queryKey: ['profile'],
    queryFn: profile,
    staleTime: 1000 * 60 * 60, // 임시로 1시간으로 지정
    cacheTime: 1000 * 60 * 60, // 임시로 1시간으로 지정
    onSuccess: (data) => {
      const authorized = data?.ok() ?? false;

      const requireAuth = matches.some(
        (item) =>
          (item.handle as { requireAuth?: boolean })?.requireAuth ?? false,
      );

      const requireNoAuth = matches.some(
        (item) =>
          (item.handle as { requireNoAuth?: boolean })?.requireNoAuth ?? false,
      );

      if (!authorized) {
        authStore.invalidateSession();
      }

      if (!authorized && requireAuth) {
        navigate('/login', { replace: true });
      }

      if (authorized && !requireNoAuth) {
        navigate('/main', { replace: true });
      }
    },
  });

  if (data.status === 'error') {
    return <>{props.errorFallback}</>;
  }

  if (data.status === 'loading') {
    return <>{props.loadingFallback}</>;
  }

  return <>{props.children}</>;
};

export default AuthorizationGuard;
