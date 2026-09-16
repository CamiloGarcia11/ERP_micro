import { ApiResponse, ProblemDetails } from '@/types/erp.types';

export class ApiError extends Error {
  constructor(public problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('erp_access_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorProblem: ProblemDetails = data && data.title ? data : {
      type: 'https://erp.local/client-error',
      title: response.statusText || 'Error en la solicitud',
      status: response.status,
      detail: data?.detail || data?.message || 'Ocurrió un error en la comunicación con el microservicio',
      instance: endpoint,
      timestamp: new Date().toISOString(),
    };
    throw new ApiError(errorProblem);
  }

  return data as ApiResponse<T>;
}
