import axios from 'axios';

// ─── Configured Axios Instance ────────────────────────────────────────────────
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Send cookies (refresh token) with every request
});

// ─── Request Interceptor: Auto-attach Authorization header ────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor: Auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    'http://localhost:5000/api/auth/refresh-token',
                    {},
                    { withCredentials: true }
                );

                if (data.success && data.token) {
                    localStorage.setItem('userToken', data.token);
                    api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
                    processQueue(null, data.token);
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed — force logout
                localStorage.removeItem('userToken');
                localStorage.removeItem('userProfile');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
