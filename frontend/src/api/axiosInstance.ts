// src\api\axiosInstance.ts:
// src/api/axiosInstance.ts
import axios from 'axios';
import { store } from '../redux/store';
import { setUser } from '../redux/userSlice';

const baseURL = 'http://localhost:8080/api/v1'; // Sử dụng biến môi trường hoặc giá trị mặc định

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('Interceptor Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && (error.response.data?.message === "Invalid token" || error.response.data?.error === "Unauthorized") && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Interceptor Response: 401 Error intercepted, attempting refresh token...");

      try {
        console.log("Interceptor Response: Calling refresh token API...");
        const refreshTokenResponse = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        if (refreshTokenResponse.status === 200) {
          const newAccessToken = (refreshTokenResponse.data as { data: { accessToken: string, user: any } }).data.accessToken;
          const user = (refreshTokenResponse.data as { data: { accessToken: string, user: any } }).data.user;

          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('user', JSON.stringify(user));
          store.dispatch(setUser(user));

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log("Interceptor Response: Refresh token successful, retrying original request.");
          return axiosInstance(originalRequest); // Retry request with new token
        } else {
          // Refresh token API trả về lỗi (non-200 status)
          console.log("Interceptor Response: Refresh token failed (non-200 status), redirecting to login");
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/signin';
          return Promise.reject(error); // Logout và reject lỗi ban đầu
        }
      } catch (refreshError) {
        // Lỗi trong quá trình gọi refresh token API (ví dụ: network error)
        console.error("Interceptor Response: Error during refresh token process:", refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError); // Logout và reject lỗi refresh token
      }
    }

    // Nếu không phải lỗi 401 hoặc đã retry refresh token rồi thì reject lỗi ban đầu
    return Promise.reject(error);
  }
);

export default axiosInstance;
