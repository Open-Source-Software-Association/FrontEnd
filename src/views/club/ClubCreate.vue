<template>
  <el-card class="create-card">
    <template #header>
      <span>创建社团</span>
    </template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="社团名称" prop="clubName">
        <el-input v-model="form.clubName" />
      </el-form-item>

      <el-form-item label="简介" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>

      <el-form-item label="会长" prop="founderUserId">
        <el-input v-model="form.founderUserId" placeholder="请输入会长工号或ID" />
      </el-form-item>

      <el-form-item label="Logo" prop="logoUrl">
        <el-upload
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :action="uploadUrl"
            :headers="uploadHeaders"
        >
          <el-button type="primary">上传 Logo</el-button>
          <span v-if="form.logoUrl" style="margin-left: 12px;">✔ 已上传</span>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { createClubService } from '@/apis/club'
import type { CreateClubDTO } from '@/types/club'

const router = useRouter()
const formRef = ref<FormInstance>()

const form = ref<CreateClubDTO>({
  clubName: '',
  description: '',
  founderUserId: '', // 改为 string 以适配输入框
  logoUrl: ''
})

const rules = {
  clubName: [{ required: true, message: '请输入社团名称', trigger: 'blur' }],
  founderUserId: [{ required: true, message: '请输入会长 ID', trigger: 'blur' }]
}

// 上传配置
const uploadUrl = '/api/files/upload/0?fileType=1' // 注意：仍建议创建成功后再上传 logo
const uploadHeaders = {}

const handleUploadSuccess = (res: any) => {
  if (res.code === 0) {
    form.value.logoUrl = res.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) ElMessage.warning('只能上传图片')
  return isImage
}

const submit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    const res = await createClubService(form.value)
    if (res.data.code === 0) {
      router.push('/club') // 成功后跳转
    } else {
      ElMessage.error(res.data.message || '创建失败')
    }
  })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.create-card {
  max-width: 600px;
  margin: 20px auto;
}
</style>
