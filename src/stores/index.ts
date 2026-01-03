import { createPinia } from 'pinia'

export const pinia = createPinia()

// 统一导出所有 Store
export * from './authStore'
export * from './menuStore'
export * from './menuPermissionStore'