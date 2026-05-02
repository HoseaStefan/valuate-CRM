import { authService } from './authService';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.18.20:3000';
export const API_URL = `${API_BASE_URL}/api`;

const buildQuery = (params?: Record<string, unknown>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const buildUrl = (path: string, params?: Record<string, unknown>) => {
  return `${path}${buildQuery(params)}`;
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await authService.getToken();

  if (!token) {
    console.warn('WARNING: No auth token available for request to:', url);
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  
  if (isFormData && headers['Content-Type'] === 'multipart/form-data') {
    delete headers['Content-Type'];
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
};

export const fetchJson = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetchWithAuth(url, options);
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 204) {
    return null as T;
  }

  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
};
