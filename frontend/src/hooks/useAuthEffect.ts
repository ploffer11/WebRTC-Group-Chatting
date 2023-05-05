import { useEffect } from 'react';

import { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ApiFetchResponse } from '../api/api.ts';
import useAuthStore from '../store/auth.ts';

const useAuthEffect = ({
  status,
  data,
}: UseQueryResult<ApiFetchResponse<unknown>>) => {
  const authStore = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'success' && data.unauthorized()) {
      if (authStore.access_token !== '') {
        authStore.invalidateSession();
      }

      navigate('/login');
    }
  }, [authStore, status, data, navigate]);
};

export default useAuthEffect;
