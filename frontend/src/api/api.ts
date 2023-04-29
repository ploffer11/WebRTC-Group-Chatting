// remove trailing slash from api url
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

async function apiFetch<T>(
  ...args: Parameters<typeof fetch>
): Promise<{ status: number; body: T }> {
  return fetch(`${baseUrl}${args[0]}`, args[1]).then(async (res) => {
    const json = (await res.json()) as T;
    return { status: res.status, body: json };
  });
}

type LoginRequestParam = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
};

export const login = (param: LoginRequestParam) => {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(param),
  });
};
