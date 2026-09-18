import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let currentAccessToken = null;

export function setAccessToken(token) {
  currentAccessToken = token || null;
}

export function getAccessToken() {
  return currentAccessToken;
}

api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = 'Bearer ' + currentAccessToken;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (status === 401 && !original?._retried && !isAuthRoute) {
      original._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        setAccessToken(data.accessToken);
        original.headers = original.headers || {};
        original.headers.Authorization = 'Bearer ' + data.accessToken;
        return api(original);
      } catch (refreshError) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
