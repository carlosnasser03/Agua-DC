/**
 * HTTP request/response builders for testing
 * Provides utilities for creating mock requests and responses
 */

export interface MockRequest {
  headers: Record<string, string>;
  body?: Record<string, any>;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  user?: Record<string, any>;
  ip?: string;
  method?: string;
  url?: string;
}

export interface MockResponse {
  status: number;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Build a mock HTTP request
 */
export class RequestBuilder {
  private request: MockRequest = {
    headers: {},
    body: {},
    params: {},
    query: {},
  };

  withMethod(method: string): this {
    this.request.method = method;
    return this;
  }

  withUrl(url: string): this {
    this.request.url = url;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.request.headers = { ...this.request.headers, ...headers };
    return this;
  }

  withAuthToken(token: string): this {
    this.request.headers.Authorization = `Bearer ${token}`;
    return this;
  }

  withDeviceId(deviceId: string): this {
    this.request.headers['x-device-id'] = deviceId;
    return this;
  }

  withBody(body: Record<string, any>): this {
    this.request.body = body;
    return this;
  }

  withParams(params: Record<string, string>): this {
    this.request.params = params;
    return this;
  }

  withQuery(query: Record<string, string | string[]>): this {
    this.request.query = query;
    return this;
  }

  withUser(user: Record<string, any>): this {
    this.request.user = user;
    return this;
  }

  withIp(ip: string): this {
    this.request.ip = ip;
    return this;
  }

  build(): MockRequest {
    return this.request;
  }
}

/**
 * Build a mock HTTP response
 */
export class ResponseBuilder {
  private response: MockResponse = {
    status: 200,
    headers: {},
  };

  withStatus(status: number): this {
    this.response.status = status;
    return this;
  }

  withBody(body: any): this {
    this.response.body = body;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.response.headers = { ...this.response.headers, ...headers };
    return this;
  }

  build(): MockResponse {
    return this.response;
  }
}

/**
 * Common request builders
 */
export const createGetRequest = (url: string, token?: string) => {
  const builder = new RequestBuilder()
    .withMethod('GET')
    .withUrl(url);
  if (token) {
    builder.withAuthToken(token);
  }
  return builder.build();
};

export const createPostRequest = (
  url: string,
  body: Record<string, any>,
  token?: string,
) => {
  const builder = new RequestBuilder()
    .withMethod('POST')
    .withUrl(url)
    .withBody(body);
  if (token) {
    builder.withAuthToken(token);
  }
  return builder.build();
};

export const createPutRequest = (
  url: string,
  body: Record<string, any>,
  token?: string,
) => {
  const builder = new RequestBuilder()
    .withMethod('PUT')
    .withUrl(url)
    .withBody(body);
  if (token) {
    builder.withAuthToken(token);
  }
  return builder.build();
};

export const createDeleteRequest = (url: string, token?: string) => {
  const builder = new RequestBuilder()
    .withMethod('DELETE')
    .withUrl(url);
  if (token) {
    builder.withAuthToken(token);
  }
  return builder.build();
};

/**
 * Common response builders
 */
export const createSuccessResponse = (body: any) => {
  return new ResponseBuilder()
    .withStatus(200)
    .withBody(body)
    .build();
};

export const createCreatedResponse = (body: any) => {
  return new ResponseBuilder()
    .withStatus(201)
    .withBody(body)
    .build();
};

export const createBadRequestResponse = (message: string) => {
  return new ResponseBuilder()
    .withStatus(400)
    .withBody({ message, error: 'Bad Request' })
    .build();
};

export const createUnauthorizedResponse = () => {
  return new ResponseBuilder()
    .withStatus(401)
    .withBody({ message: 'Unauthorized' })
    .build();
};

export const createForbiddenResponse = () => {
  return new ResponseBuilder()
    .withStatus(403)
    .withBody({ message: 'Forbidden' })
    .build();
};

export const createNotFoundResponse = () => {
  return new ResponseBuilder()
    .withStatus(404)
    .withBody({ message: 'Not Found' })
    .build();
};

export const createInternalServerErrorResponse = () => {
  return new ResponseBuilder()
    .withStatus(500)
    .withBody({ message: 'Internal Server Error' })
    .build();
};
