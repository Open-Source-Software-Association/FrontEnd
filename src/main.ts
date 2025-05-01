// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';       // 引入路由
import { pinia } from './stores'; // 从 index.ts 导入
import * as echarts from 'echarts';  // ECharts 不再全局挂载
import ElementPlus from 'element-plus';  // 引入 Element Plus
import 'element-plus/dist/index.css';    // 引入 Element Plus 的样式

const app = createApp(App);

app.config.globalProperties.$echarts = echarts;

// 使用 router
app.use(router);
app.use(pinia);
app.use(ElementPlus);  // 使用 Element Plus

// 挂载应用
app.mount('#app');