import useAuthStore from '../store/auth';

// remove trailing slash from api url
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

type FetchOptions = Exclude<Parameters<typeof fetch>[1], undefined>;
type ApiOptions = Omit<FetchOptions, 'headers'> & {
  headers: Record<string, string>;
};
class ApiFetchResponse<T> {
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

  private async send(body?: object) {
    if (this._requiresAuth) {
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

  get() {
    this.method('GET');
    return () => this.send();
  }

  post() {
    this.method('POST');
    return (body: BodyType) => this.send(body);
  }

  put() {
    this.method('PUT');
    return (body: BodyType) => this.send(body);
  }

  delete() {
    this.method('DELETE');
    return () => this.send();
  }
}

export { ApiRequest };

export { ApiFetchResponse };
