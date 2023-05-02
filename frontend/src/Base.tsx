import { Outlet } from 'react-router-dom';

import AuthorizationGuard from './components/AuthorizationGuard.tsx';
import ErrorMessage from './components/ErrorMessage.tsx';
import Loading from './components/Loading.tsx';

const Base = () => {
  return (
    <AuthorizationGuard
      loadingFallback={<Loading />}
      errorFallback={<ErrorMessage />}
    >
      <Outlet />
    </AuthorizationGuard>
  );
};

export default Base;
