export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeCredentials: boolean = true
): Promise<T> {
  const makeRequest = async (token?: string): Promise<Response> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const config: RequestInit = {
      ...options,
      headers,
      mode: 'cors',
      credentials: includeCredentials ? 'include' : 'omit',
    };

    return fetch(endpoint, config);
  };

  try {
    let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    let response = await makeRequest(token || undefined);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new ApiError(
        response.status,
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    const data = JSON.parse(text);
    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}
