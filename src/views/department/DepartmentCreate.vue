<template>
  <el-card>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="部门名称" prop="departmentName">
        <el-input v-model="form.departmentName" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createDepartmentService } from '@/apis/department'

const router = useRouter()
const formRef = ref()
const form = ref({
  clubId: 1, // ⚠️ 写死或从上层传参
  departmentName: '',
  description: ''
})
const rules = {
  departmentName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

const handleSubmit = async () => {
  await formRef.value.validate()
  const res = await createDepartmentService(form.value)
  if (res.data.code === 0) {
    ElMessage.success('创建成功')
    router.push('/department/list')
  } else {
    ElMessage.error(res.data.message || '创建失败')
  }
}
</script>
