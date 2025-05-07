// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './stores';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import * as echarts from 'echarts';  // echarts 实例
import VueECharts from 'vue-echarts';

const app = createApp(App);

// 全局挂载 echarts 实例（可选）
app.config.globalProperties.$echarts = echarts;

// 注册 vue-echarts 组件（使用标签 <v-chart>）
app.component('v-chart', VueECharts);

// 挂载核心插件
app.use(router);
app.use(pinia);
app.use(ElementPlus);

// 启动应用
app.mount('#app');
