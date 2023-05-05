import { useEffect } from 'react';

import { UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '../store/auth.ts';

const useAuthEffect = ({ status, data }: UseQueryResult<AxiosResponse>) => {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'success' && data.status === 401) {
      if (authStore.access_token !== '') {
        authStore.invalidateSession();
      }

      navigate('/login');
    }
  }, [authStore, status, data, navigate]);
};

export default useAuthEffect;
