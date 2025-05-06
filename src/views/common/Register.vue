<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userRegisterService } from '@/apis/users'
import type { RegisterDTO } from '@/types/users'

// 表单数据
const nickName = ref('')
const jobNumber = ref('')
const password = ref('')
const confirmPwd = ref('')

const router = useRouter()

// 注册处理函数
const register = async () => {
  if (!nickName.value || !jobNumber.value || !password.value || !confirmPwd.value) {
    ElMessage.warning('请填写所有字段')
    return
  }

  if (password.value !== confirmPwd.value) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  try {
    const registerData: RegisterDTO = {
      nickName: nickName.value,
      jobNumber: jobNumber.value,
      password: password.value
    }

    const res = await userRegisterService(registerData)

    if (res.code === 0) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error(res.message || '注册失败')
    }
  } catch (error) {
    console.error('注册异常:', error)
    ElMessage.error('注册过程中出现错误')
  }
}
</script>

<template>
  <div class="register-box">
    <div class="form-container">
      <h2>注册账号</h2>
      <form @submit.prevent="register">
        <el-input v-model="nickName" placeholder="昵称" class="input" clearable />
        <el-input v-model="jobNumber" placeholder="工号" class="input" clearable />
        <el-input v-model="password" placeholder="密码" class="input" show-password />
        <el-input v-model="confirmPwd" placeholder="确认密码" class="input" show-password />

        <el-button type="primary" class="submit-btn" @click="register" block>注册</el-button>
        <el-button type="text" class="back-btn" @click="() => router.push('/login')" block>已有账号？去登录</el-button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}

.form-container {
  width: 360px;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.input {
  margin-bottom: 16px;
}

.submit-btn {
  margin-top: 8px;
}

.back-btn {
  margin-top: 12px;
  text-align: center;
}
</style>
