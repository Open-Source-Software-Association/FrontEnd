// src/apis/request.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

/**
* 创建 Axios 实例，根据环境变量自动配置 baseURL
* 开发环境：通过 Vite 代理转发请求（路径为 /api/xxx）
* 生产环境：直连后端服务器
*/
// 自动根据环境设置 baseURL
const isDev = import.meta.env.MODE === 'development';

const request = axios.create({
    baseURL: isDev ? '/api/dev' : 'http://localhost:8080/api/dev',
    timeout: 10000,
});

// 请求拦截器：自动注入 Token
request.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：统一处理 401 未授权
request.interceptors.response.use(
    (response) => {
        // 确保 response 是完整响应对象，而不是 response.data
        return response;
    }, // 直接返回 data 字段
    (error) => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.clearAuth();      // 清除 Token
            window.location.href = '/login'; // 跳转登录页
        }
        return Promise.reject(error);
    }
);

export default request;