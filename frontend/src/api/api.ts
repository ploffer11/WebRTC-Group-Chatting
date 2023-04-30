import useAuthStore from '../store/auth';

// remove trailing slash from api url
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

type FetchOptions = Exclude<Parameters<typeof fetch>[1], undefined>;
type ApiOptions = Omit<FetchOptions, 'body'> & { body?: object };
class ApiFetchResult<T> {
  constructor(public status: number, public body: T) {}

  good() {
    return 200 <= this.status && this.status < 300;
  }

  ok() {
    return this.status === 200;
  }
  unauthorized() {
    return this.status === 401;
  }
  serverError() {
    return this.status === 500;
  }
}

async function apiFetch<T>(
  resource: Parameters<typeof fetch>[0],
  options: ApiOptions,
): Promise<ApiFetchResult<T>> {
  const defaultOptions: FetchOptions = {
    headers: {
      Authorization: `Bearer ${useAuthStore.getState().access_token}`,
      'Content-Type': 'application/json',
    },
  };

  const fetchOptions = Object.assign(defaultOptions, options, {
    headers: Object.assign({}, defaultOptions.headers, options.headers ?? {}),
    body: JSON.stringify(options.body),
  });

  return fetch(`${baseUrl}${resource}`, fetchOptions).then(async (res) => {
    const json = (await res.json()) as T;
    return new ApiFetchResult<T>(res.status, json);
  });
}

function GetApi<ResponseType extends object>(
  endpoint: string,
  options: ApiOptions,
) {
  return () => apiFetch<ResponseType>(endpoint, { method: 'GET', ...options });
}

function PostApi<RequestType extends object, ResponseType extends object>(
  endpoint: string,
  options: ApiOptions,
) {
  return (body: RequestType) =>
    apiFetch<ResponseType>(endpoint, { method: 'POST', body, ...options });
}

function PutApi<RequestType extends object, ResponseType extends object>(
  endpoint: string,
  options: ApiOptions,
) {
  return (body: RequestType) =>
    apiFetch<ResponseType>(endpoint, { method: 'PUT', body, ...options });
}

function DeleteApi<ResponseType extends object>(
  endpoint: string,
  options: ApiOptions,
) {
  return () =>
    apiFetch<ResponseType>(endpoint, { method: 'DELETE', ...options });
}

export { GetApi, PostApi, PutApi, DeleteApi };
