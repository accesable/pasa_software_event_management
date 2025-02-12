// src/utils/api.ts
const API_BASE_URL = 'http://47.129.247.0:8080/api/v1'; // Thay đổi nếu cần

const api = {
  get: async <T>(url: string, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...config,
      method: 'GET',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return handleResponse(response);
  },

  post: async <T>(url: string, data?: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...config,
      method: 'POST',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async <T>(url: string, data?: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...config,
      method: 'PUT',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async <T>(url: string, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...config,
      method: 'DELETE',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    return handleResponse(response);
  },
  // ... you can add more methods here for PATCH, etc.
  patch: async <T>(url: string, data?: any, config?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...config,
      method: 'PATCH',
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  const data = text && JSON.parse(text); // Parse JSON only if not empty

  if (!response.ok) {
    const error = data?.error || data?.message || response.statusText || 'An unexpected error occurred.';
    return Promise.reject(new Error(error));
  }

  return data;
};

export default api;
