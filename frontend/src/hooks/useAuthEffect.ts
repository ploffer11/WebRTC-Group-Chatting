import { useEffect } from 'react';

import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ApiFetchResponse } from '../api/api.ts';
import useAuthStore from '../store/auth.ts';

const useAuthEffect = (data: UseQueryResult<ApiFetchResponse<unknown>>) => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (data.status === 'success' && data.data.unauthorized()) {
      if (authStore.access_token !== '') {
        authStore.invalidateSession();
      }

      queryClient
        .invalidateQueries({ queryKey: ['profile'], exact: true })
        .then(() => {
          navigate('/login');
        });
    }
  }, [authStore, data.status, data.data, navigate, queryClient]);
};

export default useAuthEffect;
