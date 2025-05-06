<template>
  <el-card class="form-card">
    <template #header>
      <div class="card-header">编辑社团</div>
    </template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" v-loading="loading">
      <el-form-item label="社团名称" prop="clubName">
        <el-input v-model="form.clubName" placeholder="请输入社团名称" />
      </el-form-item>

      <el-form-item label="简介" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入简介" />
      </el-form-item>

      <el-form-item label="Logo" prop="logoUrl">
        <el-upload :show-file-list="false" :before-upload="beforeUpload" :http-request="uploadLogo">
          <el-button type="primary">上传 Logo</el-button>
        </el-upload>
        <el-image v-if="form.logoUrl" :src="form.logoUrl" style="margin-top: 10px; width: 100px" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleUpdate">提交</el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClubByIdService, updateClubService, uploadClubLogoService } from '@/apis/club'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)
const authStore = useAuthStore()

const form = ref({
  clubId: 0,
  clubName: '',
  description: '',
  founderUserId: authStore.userInfo.userId,
  logoUrl: ''
})

const rules = {
  clubName: [{ required: true, message: '请输入社团名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }]
}

const fetchClub = async () => {
  const clubId = parseInt(route.params.clubId as string)
  if (isNaN(clubId)) {
    ElMessage.error('无效的社团 ID')
    return
  }
  loading.value = true
  const res = await getClubByIdService(clubId)
  loading.value = false
  if (res.data?.code === 0 || res.data?.code === 200) {
    form.value = { ...res.data.data, founderUserId: authStore.userInfo.userId }
  } else {
    ElMessage.error(res.data?.message || '加载社团失败')
  }
}
onMounted(fetchClub)

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('只能上传图片')
  if (!isLt2M) ElMessage.error('图片大小不能超过2MB')
  return isImage && isLt2M
}

const uploadLogo = async ({ file }: { file: File }) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await uploadClubLogoService(formData)
  if (res.data?.code === 200 || res.data?.code === 0) {
    form.value.logoUrl = res.data.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.data?.message || '上传失败')
  }
}

const handleUpdate = async () => {
  await formRef.value.validate()
  const res = await updateClubService(form.value)
  if (res.data?.code === 200 || res.data?.code === 0) {
    ElMessage.success('修改成功')
    router.push('/club/list')
  } else {
    ElMessage.error(res.data?.message || '修改失败')
  }
}
</script>

<style scoped>
.form-card {
  max-width: 600px;
  margin: 30px auto;
}
</style>
