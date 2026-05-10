// API Configuration
// Centralized API URL configuration for all services

// Get the base API URL based on environment
export const getApiBaseUrl = (): string => {
  // Check if VITE_API_URL is explicitly set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: use proxy to localhost:3001
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  // Production fallback: relative path to deployed API
  return '/api';
};

export const buildApiUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (path.startsWith('/api/')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    if (isJson && body) {
      const errorData = JSON.parse(body) as {
        error?: string;
        message?: string;
        details?: string;
      };
      throw new Error(errorData.error || errorData.message || errorData.details || `${response.status} ${response.statusText}`);
    }

    throw new Error(body.trim() || `${response.status} ${response.statusText}`);
  }

  if (!isJson) {
    const preview = body.trim();
    if (preview.startsWith('<!DOCTYPE') || preview.startsWith('<html')) {
      throw new Error('Received HTML instead of JSON from the API. Ensure the backend is running and the Vite proxy is enabled.');
    }

    throw new Error(`Expected JSON response but received ${contentType || 'an unknown content type'}`);
  }

  return JSON.parse(body) as T;
}

// Get the base server URL (for image URLs, etc.)
export const getServerBaseUrl = (): string => {
  // Development: use the frontend origin with proxy
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Check if VITE_API_URL is set, remove /api suffix if present
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  
  // Production fallback: use current origin
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// Export configured URLs
export const API_BASE_URL = getApiBaseUrl();
export const SERVER_BASE_URL = getServerBaseUrl();