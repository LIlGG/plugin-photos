import axios from "axios";
import type { AxiosError } from "axios";
import { Toast } from "@halo-dev/components";

export interface ProblemDetail {
  detail: string;
  instance: string;
  status: number;
  title: string;
  type?: string;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ProblemDetail>) => {
    if (/Network Error/.test(error.message)) {
      Toast.error("网络错误，请检查网络连接");
      return Promise.reject(error);
    }

    const errorResponse = error.response;

    if (!errorResponse) {
      Toast.error("网络错误，请检查网络连接");
      return Promise.reject(error);
    }

    const { status } = errorResponse;

    const { title } = errorResponse.data;

    // Don't show error toast
    // see https://github.com/halo-dev/halo/issues/2836
    if (errorResponse.config.mute) {
      return Promise.reject(error);
    }

    if (status === 400) {
      Toast.error(`请求参数错误：${title}`);
    } else if (status === 403) {
      Toast.error("无权限访问");
    } else if (status === 404) {
      Toast.error("资源不存在");
    } else if (status === 500) {
      Toast.error(`服务器内部错误：${title}`);
    } else {
      Toast.error(`未知错误：${title}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
