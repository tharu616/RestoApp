import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 403
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 403 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const res = await axios.post('http://localhost:5000/api/auth/refresh', { token: refresh });
        localStorage.setItem('accessToken',  res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;