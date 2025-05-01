<script setup lang="ts">
import { ref, onMounted } from 'vue';
import lottie from 'lottie-web';
import {ElMessage} from "element-plus";

// 定义动画容器的引用
const animationContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  try {
    // 手动加载 Lottie 文件内容
    const response = await fetch('/lotteries/404.json');

    // 检查响应状态码
    if (!response.ok) {
      ElMessage.error(`Failed to load Lottie file: ${response.status} ${response.statusText}`);
    }

    // 解析 JSON 数据
    const animationData = await response.json();

    // 确保动画容器已挂载
    if (animationContainer.value) {
      lottie.loadAnimation({
        container: animationContainer.value, // 动画容器
        renderer: 'svg', // 渲染方式
        loop: true, // 是否循环
        autoplay: true, // 自动播放
        animationData, // 使用解析后的数据
      });
    }
  } catch (error) {
    console.error('Failed to load Lottie animation:', error);
  }
});
</script>

<template>
  <div>
    <!-- 动画容器 -->
    <div class="full-screen-animation" ref="animationContainer"></div>
  </div>
</template>

<style scoped>
/* 全屏动画容器样式 */
.full-screen-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999; /* 确保覆盖其他内容 */
  background-color: #ffffff; /* 背景颜色 */
}
</style>