// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
      vue(),
],
resolve: {
  alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // 路径别名
    },
  },
  server: {
    host: '0.0.0.0',       // 允许局域网访问
    port: 5173,            // 开发服务器端口
    proxy: {
      '/api': {            // 代理所有 /api 开头的请求
        target: 'http://172.23.196.190:8080', // 后端地址
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/api/, ''), // 移除 /api 前缀（按需调整）
      },
    },
  },
});