import useAuthStore from '../store/auth';

// remove trailing slash from api url
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

type FetchOptions = Exclude<Parameters<typeof fetch>[1], undefined>;
type ApiOptions = Omit<FetchOptions, 'headers'> & {
  headers: Record<string, string>;
};
class ApiFetchResponse<T> {
  constructor(public status: number, public body?: T) {
    if (status === 401) {
      useAuthStore.setState({ access_token: '' });
    }
  }

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

class ApiRequest<BodyType extends object, ResponseType> {
  options: ApiOptions = {
    headers: {},
  };

  private _requiresAuth = false;

  constructor(
    public resource: Parameters<typeof fetch>[0],
    options?: ApiOptions,
  ) {
    Object.assign(this.options, options);
  }

  method(httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE') {
    this.options.method = httpMethod;
    return this;
  }

  requiresAuth() {
    this._requiresAuth = true;
    return this;
  }

  async send(body?: object) {
    if (this._requiresAuth) {
      const accessToken = useAuthStore.getState().access_token;
      if (!accessToken) {
        return new ApiFetchResponse<never>(401);
      }

      this.options.headers['Authorization'] = `Bearer ${
        useAuthStore.getState().access_token
      }`;
    }

    if (body) {
      this.options.headers['Content-Type'] =
        this.options.headers['Content-Type'] ?? 'application/json';
      this.options.body = this.options.body ?? JSON.stringify(body);
    }

    const res = await fetch(`${baseUrl}${this.resource}`, this.options);
    const json = (await res.json()) as ResponseType;

    return new ApiFetchResponse<ResponseType>(res.status, json);
  }

  build() {
    return (body?: BodyType) => this.send(body);
  }
}

function GetApi<ResponseType>(endpoint: string, options?: ApiOptions) {
  return new ApiRequest<never, ResponseType>(endpoint, options).method('GET');
}

function PostApi<RequestType extends object, ResponseType>(
  endpoint: string,
  options?: ApiOptions,
) {
  return new ApiRequest<RequestType, ResponseType>(endpoint, options).method(
    'POST',
  );
}

function PutApi<RequestType extends object, ResponseType>(
  endpoint: string,
  options?: ApiOptions,
) {
  return new ApiRequest<RequestType, ResponseType>(endpoint, options).method(
    'PUT',
  );
}

function DeleteApi<ResponseType>(endpoint: string, options?: ApiOptions) {
  return new ApiRequest<never, ResponseType>(endpoint, options).method(
    'DELETE',
  );
}

export { GetApi, PostApi, PutApi, DeleteApi };
