const AuthRequiredHandle = { redirectIfNoAuth: '/login' };
const NoAuthRequiredHandle = { redirectIfAuth: '/main' };
const IndexHandle = { ...AuthRequiredHandle, ...NoAuthRequiredHandle };

export const AuthRequiredRoute = {
  handle: AuthRequiredHandle,
};

export const NoAuthRequiredRoute = {
  handle: NoAuthRequiredHandle,
};

export const IndexRoute = {
  handle: IndexHandle,
};
