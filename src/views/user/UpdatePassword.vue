<template>
  <el-card class="password-card">
    <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="旧密码" prop="oldPwd">
        <el-input v-model="form.oldPwd" type="password" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input v-model="form.newPwd" type="password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPwd">
        <el-input v-model="form.confirmPwd" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleUpdate">修改密码</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { updatePasswordService } from '@/apis/users'

const form = reactive({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

const rules = {
  oldPwd: [{ required: true, message: '请输入旧密码' }],
  newPwd: [{ required: true, message: '请输入新密码' }],
  confirmPwd: [
    { required: true, message: '请确认密码' },
    {
      validator: (_, value) => value === form.newPwd,
      message: '两次密码不一致'
    }
  ]
}

const formRef = ref<FormInstance>()

const handleUpdate = async () => {
  await formRef.value?.validate()
  const res = await updatePasswordService(form)
  if (res.code === 0) {
    ElMessage.success('密码修改成功')
  } else {
    ElMessage.error('密码修改失败')
  }
}
</script>

<style scoped>
.password-card {
  max-width: 500px;
  margin: 50px auto;
}
</style>
