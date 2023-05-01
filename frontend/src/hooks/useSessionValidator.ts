import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { profile } from '../api/auth';
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
      // Validate session by fetching user profile
      profile().then((resp) => {
        if (!resp.good()) {
          authStore.invalidateSession();
          navigate('/login');
        }
      });
    }
  }, [navigate, authStore]);
}
