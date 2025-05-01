<template>
  <div class="box">
    <div class="right">
      <h4>登录</h4>
      <form @submit.prevent="login">
        <input v-model="jobNumber" placeholder="jobNumber" type="text" required />
        <input v-model="password" placeholder="Password" type="password" required />
        <button class="login" type="submit">login</button>
      </form>
      <!--      <div class="fn">-->
      <!--        <button class="regist" type="button" @click="navigateToRegister">regist</button>-->
      <!--      </div>-->
    </div>
    <div class="left">
      <img src="@/assets/images/log.png" alt="log" class="login"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { ElMessage } from 'element-plus'
import {
  userLoginService,
  getUserInfoService,
} from '@/apis/users';

import type {
  LoginDTO,
  LoginVO,
  InfoVO
} from '@/types/users';

import type {Result} from "@/apis/common";

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const jobNumber = ref<string>('');
const password = ref<string>('');

// 登录操作（已优化为 async/await）
const login = async () => {
  try {
    // 1. 执行登录
    const loginData: LoginDTO = {
      jobNumber: jobNumber.value,
      password: password.value
    };

    console.log(loginData)
    const loginResponse: Result<LoginVO> = await userLoginService(loginData);

    // 2. 处理登录响应
    if (loginResponse.code !==200 || !loginResponse.data.token) {
      ElMessage.error(loginResponse.message || '登录失败');
      console.error('登录失败:', loginResponse.message);
      return; // 提前返回，不继续执行
    }

    // 3. 存储 Token
    authStore.setToken(loginResponse.data.token);

    // 4. 获取用户信息
    const infoResponse: Result<InfoVO> = await getUserInfoService();

    if (infoResponse?.code !== 200 || !infoResponse.data) {
      ElMessage.error(infoResponse.message || '用户信息获取失败');
      console.error('用户信息获取失败:', infoResponse.message);
      return; // 提前返回，不继续执行
    }

    // 5. 存储用户信息
    authStore.setUserInfo(infoResponse.data);

    // 6. 跳转首页
    await router.replace('/');
  } catch (error) {
    console.error('登录流程异常:', error instanceof Error ? error.message : error);
    // 这里可以添加 UI 错误提示（如 Element Plus 的 ElMessage）
  }
};

// 注册跳转（根据注释状态判断是否需要保留）
/* const navigateToRegister = () => {
  router.push('/register');
}; */
</script>

<style scoped>
.box {
  display: flex;
  overflow: hidden;
  width: 50rem;
  height: 30rem;
  border-radius: 1.5rem;
  margin: 5% auto;
  box-shadow: 0 0 1rem 0.2rem rgb(0 0 0 /10%);
  background: #ffffff linear-gradient(rgba(0, 0, 0, 0.5), rgba(16, 160, 173, 0.5));
}

.right {
  width: 50%;
  height: 100%;
  float: right;
  padding: 3rem;
  box-sizing: border-box;
}

.right h4 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.right input, .right select {
  width: 100%;
  height: 3rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
  box-sizing: border-box;
  border: none;
  border-radius: 0.5rem;
}

.right button {
  width: 100%;
  height: 3rem;
  background-color: #10a0ad;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.right button:hover {
  background-color: #0c7b84;
}

.login {
  width: 100%;
  height: 100%;
}
</style>

<style>
body {
  /* background: linear-gradient(rgba(0,0,0,0.5),rgba(16, 160, 173, 0.5)); */
  background-color: #ffffff;
}
</style>