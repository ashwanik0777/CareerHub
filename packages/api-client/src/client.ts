import { 
  ApiError, 
  ValidationError, 
  AuthenticationError, 
  ForbiddenError, 
  NotFoundError, 
  InternalServerError 
} from '@platform/utils';

export interface RequestOptions extends RequestInit {
  token?: string;
  retries?: number;
  backoffDelayMs?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { token, retries = 3, backoffDelayMs = 300, ...fetchOptions } = options;
    const url = `${this.baseUrl}${path}`;

    // Add authorization and JSON content headers
    const headers = new Headers(fetchOptions.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    fetchOptions.headers = headers;

    let attempt = 0;

    while (attempt < retries) {
      try {
        const response = await fetch(url, fetchOptions);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return (await response.json()) as T;
          }
          return (await response.text()) as unknown as T;
        }

        // Handle error responses and map them to custom exceptions
        const statusCode = response.status;
        let errorMessage = 'An unexpected HTTP error occurred';
        let errorDetails: Record<string, string[]> | undefined;
        let errorCode = 'API_ERROR';

        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.error) {
            errorMessage = errorJson.error.message || errorMessage;
            errorDetails = errorJson.error.details || undefined;
            errorCode = errorJson.error.code || errorCode;
          }
        } catch {
          // If response body is not JSON, fallback to standard statusText
          errorMessage = response.statusText || errorMessage;
        }

        // Map status codes to custom error classes
        if (statusCode === 400) {
          throw new ValidationError(errorMessage, errorDetails);
        } else if (statusCode === 401) {
          throw new AuthenticationError(errorMessage);
        } else if (statusCode === 403) {
          throw new ForbiddenError(errorMessage);
        } else if (statusCode === 404) {
          throw new NotFoundError(errorMessage);
        } else if (statusCode >= 500) {
          // If internal error, retry on network/server status codes
          if (attempt + 1 < retries) {
            attempt++;
            const delay = backoffDelayMs * Math.pow(2, attempt);
            await this.sleep(delay);
            continue;
          }
          throw new ApiError(errorMessage, statusCode, errorCode, errorDetails);
        } else {
          throw new ApiError(errorMessage, statusCode, errorCode, errorDetails);
        }

      } catch (error) {
        // If network error, retry
        if (error instanceof TypeError && attempt + 1 < retries) {
          attempt++;
          const delay = backoffDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerError('Request retry threshold exceeded');
  }

  public async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public async post<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async put<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
