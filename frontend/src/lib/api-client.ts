import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

// Get API URL - in Codespaces, use relative path or current host
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If env URL is explicitly set, use it
  if (envUrl) return envUrl;
  
  // If we're in a browser and not on localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // In Codespaces, ports are forwarded with unique URLs
    // Replace the port in the current URL with 3000
    const currentUrl = window.location.href;
    const match = currentUrl.match(/https?:\/\/[^/]+/);
    if (match) {
      // Extract base URL and replace port references
      const baseUrl = match[0].replace(/-5173/, '-3000');
      return `${baseUrl}/api/v1`;
    }
  }
  
  return 'http://localhost:3000/api/v1';
};

const API_URL = getApiUrl();

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest: any = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data.data;
              localStorage.setItem('accessToken', accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
