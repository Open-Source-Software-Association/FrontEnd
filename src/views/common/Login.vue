<template>
  <div class="box">
    <div class="right">
      <h4>登录</h4>
      <form @submit.prevent="login">
        <input v-model="jobNumber" placeholder="jobNumber" type="text" required />
        <input v-model="password" placeholder="Password" type="password" required />
        <button class="login" type="submit">login</button>
      </form>

      <!-- ✅ 注册跳转入口 -->
      <div class="register-link">
        <span>还没有账号？</span>
        <a @click="navigateToRegister">点击注册</a>
      </div>
    </div>
    <div class="left">
      <img src="@/assets/images/log.png" alt="log" class="login" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { ElMessage } from 'element-plus'
import { userLoginService, getUserInfoService } from '@/apis/users';
import type { LoginDTO, LoginVO, InfoVO } from '@/types/users';
import type { Result } from "@/apis/common";

const router = useRouter();
const authStore = useAuthStore();

const jobNumber = ref('');
const password = ref('');

// 登录操作
const login = async () => {
  try {
    const loginData: LoginDTO = { jobNumber: jobNumber.value, password: password.value };
    const loginResponse: Result<LoginVO> = await userLoginService(loginData);

    if (loginResponse.code !== 200 || !loginResponse.data?.token) {
      ElMessage.error(loginResponse.message || '登录失败');
      return;
    }

    authStore.setToken(loginResponse.data.token);

    const infoResponse: Result<InfoVO> = await getUserInfoService();
    if (infoResponse.code !== 200 || !infoResponse.data) {
      ElMessage.error(infoResponse.message || '用户信息获取失败');
      return;
    }

    authStore.setUserInfo(infoResponse.data);
    await router.replace('/');
  } catch (error) {
    console.error('登录异常:', error);
    ElMessage.error('登录异常，请稍后重试');
  }
};

// ✅ 注册页跳转逻辑
const navigateToRegister = () => {
  router.push('/Register');
};
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
  padding: 3rem;
  box-sizing: border-box;
}

.right h4 {
  color: #fff;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.right input {
  width: 100%;
  height: 3rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
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

/* ✅ 注册链接样式 */
.register-link {
  margin-top: 1rem;
  color: white;
  text-align: center;
}

.register-link a {
  color: #00ffff;
  cursor: pointer;
  margin-left: 0.5rem;
  text-decoration: underline;
}

.left {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left .login {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<style>
body {
  background-color: #ffffff;
}
</style>
