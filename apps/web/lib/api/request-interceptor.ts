import { axiosInstance } from "./axios";
import { getToken, clearToken } from "@/services/auth/auth-service";

export function setupInterceptors(): void {
  axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearToken();
        if (typeof window !== "undefined") window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    },
  );
}
