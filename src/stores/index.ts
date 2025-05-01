// stores/index.ts
import { createPinia } from 'pinia';
export const pinia = createPinia();

// 统一导出所有 Store
export * from './authStore'; // 导出 useAuthStore