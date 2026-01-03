// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './stores';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import * as echarts from 'echarts';  // echarts 实例
import VueECharts from 'vue-echarts';

// 导入权限指令
import { setupPermissionDirective } from '@/directives/permission';

// 导入组件测试工具（开发环境）
import '@/utils/componentTest';

const app = createApp(App);

// 全局挂载 echarts 实例（可选）
app.config.globalProperties.$echarts = echarts;

// 注册 vue-echarts 组件（使用标签 <v-chart>）
app.component('v-chart', VueECharts);

// 挂载核心插件
app.use(router);
app.use(pinia);
app.use(ElementPlus);

// 注册权限指令
setupPermissionDirective(app);

// 全局页面刷新处理
window.addEventListener('beforeunload', () => {
  // 标记页面即将刷新
  sessionStorage.setItem('pageRefreshing', 'true');
});

// 页面加载完成后检查是否为刷新
window.addEventListener('load', () => {
  const isRefreshing = sessionStorage.getItem('pageRefreshing');
  if (isRefreshing) {
    sessionStorage.removeItem('pageRefreshing');
    // 如果当前不在首页且已登录，跳转到首页
    const token = localStorage.getItem('token');
    if (token && window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      console.log('检测到页面刷新，重定向到首页');
      window.location.href = '/';
    }
  }
});

// 更强制的刷新检测
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否为页面刷新
  const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const isReload = navigationEntries.length > 0 && navigationEntries[0].type === 'reload';
  
  if (isReload) {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    
    if (token && currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register') {
      console.log('Performance API检测到页面刷新，重定向到首页');
      window.location.replace('/');
    }
  }
});

// 启动应用
app.mount('#app');
