// frontend/src/lib/axiosInstance.ts
import axios from 'axios';
import { tokenService } from '@/services/token.service';

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Biến để theo dõi yêu cầu refresh
let isRefreshing = false;
// Hàng đợi các request bị lỗi 401
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Hàm xử lý đẩy các request trong hàng đợi
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Đính kèm Access Token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenService.getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. Response Error Interceptor: Xử lý khi Access Token hết hạn (401)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = tokenService.getRefreshToken();

    // Chỉ xử lý lỗi 401, và không phải là request refresh token bị lỗi
    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/user/refresh' &&
      refreshToken
    ) {
      // Nếu đang refresh rồi thì đẩy request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Đánh dấu đang refresh
      isRefreshing = true;

      try {
        // Gọi API để refresh token
        const rs = await axios.post(`${API_BASE_URL}/user/refresh`, {
          refreshToken: tokenService.getRefreshToken(),
        });

        const { accessToken, refreshToken: newRefreshToken } = rs.data;

        // Lưu token mới
        tokenService.setAccessToken(accessToken);
        tokenService.setRefreshToken(newRefreshToken);

        // Xử lý hàng đợi (thực thi lại các request cũ với token mới)
        processQueue(null, accessToken);

        // Thực thi lại request gốc
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return axiosInstance(originalRequest);
      } catch (_error: any) {
        // Nếu refresh thất bại (ví dụ: refresh token hết hạn)
        processQueue(_error, null);
        tokenService.clearTokens();
        // Đẩy người dùng về trang login
        window.location.href = '/login';
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;