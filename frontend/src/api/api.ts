import { IUserCredentials, IAuthResult, ICreateUser } from '@schema/auth';

// remove trailing slash from api url
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

type FetchOptions = Exclude<Parameters<typeof fetch>[1], undefined>;
type ApiOptions = Omit<FetchOptions, 'body'> & { body: object };

async function apiFetch<T>(
  resource: Parameters<typeof fetch>[0],
  options: ApiOptions,
): Promise<{ status: number; body: T }> {
  const defaultOptions: FetchOptions = {
    headers: { 'Content-Type': 'application/json' },
  };

  const fetchOptions = Object.assign(defaultOptions, options, {
    headers: Object.assign({}, defaultOptions.headers, options.headers ?? {}),
    body: JSON.stringify(options.body),
  });

  return fetch(`${baseUrl}${resource}`, fetchOptions).then(async (res) => {
    const json = (await res.json()) as T;
    return { status: res.status, body: json };
  });
}

export const login = (param: IUserCredentials) => {
  return apiFetch<IAuthResult>('/auth/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: param,
  });
};

export const signup = (param: ICreateUser) => {
  return apiFetch<IAuthResult>('/auth/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: param,
  });
};
