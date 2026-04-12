import axios from 'axios';
import { API_BASE_URL, RAILWAY_API } from '../utils/constants';
import { store } from '../store';
import { loginSuccess, logout } from '../store/slices/authSlice';

// Exported so screens can display user-friendly rate-limit messages
export const RATE_LIMIT_MESSAGE = 'Too many requests. Please wait a moment and try again.';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — yt-dlp info/download can take 15-30s on slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (error: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If local server is unreachable for any reason (network error, timeout, cleartext block, DNS fail, etc.)
    // retry once on Railway. _railwayRetry flag prevents infinite loops.
    // Guard against undefined config (e.g. request setup errors)
    const isNetworkError = !error.response;
    if (isNetworkError && originalRequest && !originalRequest._railwayRetry) {
      originalRequest._railwayRetry = true;
      // Strip any local base from the URL to get just the path (e.g. /api/info)
      const path = originalRequest.url
        ?.replace(API_BASE_URL, '')
        ?.replace(RAILWAY_API, '') ?? originalRequest.url;
      const token = store.getState().auth.token;
      return axios({
        ...originalRequest,
        url: path,
        baseURL: RAILWAY_API,
        timeout: 30000, // give Railway the full 30s
        headers: {
          ...originalRequest.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    }

    // Surface rate-limit errors with a clear message instead of a generic network error
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter ?? error.response.headers?.['retry-after'];
      const msg = retryAfter
        ? `Too many requests. Please wait ${retryAfter}s and try again.`
        : RATE_LIMIT_MESSAGE;
      const rateLimitError = new Error(msg);
      Object.assign(rateLimitError, { response: error.response, isRateLimit: true });
      return Promise.reject(rateLimitError);
    }

    // Only attempt refresh for 401s when we have a token (authenticated user)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      store.getState().auth.token
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

        const { token, refreshToken: newRefreshToken } = response.data;
        const currentUser = store.getState().auth.user;
        if (currentUser) {
          store.dispatch(loginSuccess({ token, refreshToken: newRefreshToken, user: currentUser }));
        }

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
