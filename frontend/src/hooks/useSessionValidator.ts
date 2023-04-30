import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import useAuthStore from '../store/auth';

/**
 * Guarantee this session is in valid auth state.
 */
export default function useSessionValidator() {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  useEffect(() => {
    if (authStore.access_token === '') {
      navigate('/login');
    } else {
      authStore.validate().catch(() => {
        navigate('/login');
      });
    }
  }, [navigate, authStore]);
}
