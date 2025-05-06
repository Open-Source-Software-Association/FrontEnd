<template>
  <el-card class="user-info-card">
    <template #header>
      <div class="card-header">个人信息</div>
    </template>

    <!-- 头像 + 更换按钮横向排列 -->
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <el-avatar :size="80" :src="user.avatarUrl" />
      <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadAvatar"
      >
        <el-button size="small" type="primary" style="margin-left: 16px;">更换头像</el-button>
      </el-upload>
    </div>

    <!-- 信息表单 -->
    <el-form :model="user" label-width="80px">
      <el-form-item label="昵称">
        <el-input v-model="user.nickName" />
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="user.phone" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="user.email" />
      </el-form-item>
      <el-form-item label="学院">
        <el-input v-model="user.college" />
      </el-form-item>
      <el-form-item label="专业">
        <el-input v-model="user.major" />
      </el-form-item>
      <el-form-item label="年级">
        <el-input v-model="user.grade" />
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="submitUpdate">保存修改</el-button>
    <el-button @click="toUpdatePwd">修改密码</el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getUserInfoService, updateUserInfoService, uploadAvatarService } from '@/apis/users'
import type { InfoVO } from '@/types/users'

// 初始化
const user = ref<InfoVO>({
  userId: 0,
  roleId: 0,
  clubId: 0,
  departmentId: 0,
  nickName: '',
  jobNumber: '',
  phone: '',
  email: '',
  avatarUrl: '',
  gender: 0,
  college: '',
  major: '',
  grade: ''
})

// 获取用户信息
const fetchUser = async () => {
  const res = await getUserInfoService()
  if ((res.code === 0 || res.code === 200) && res.data) {
    user.value = res.data
  } else {
    ElMessage.error(res.message || '获取用户信息失败')
  }
}
onMounted(fetchUser)

// 保存修改（只传 InfoDTO 字段）
const submitUpdate = async () => {
  const updateData = {
    phone: user.value.phone,
    nickName: user.value.nickName,
    email: user.value.email,
    jobNumber: user.value.jobNumber,
    gender: user.value.gender,
    college: user.value.college,
    major: user.value.major,
    grade: user.value.grade
  }

  const res = await updateUserInfoService(updateData)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    await fetchUser()
  } else {
    ElMessage.error(res.message || '更新失败')
  }
}

// 上传头像前检查
const beforeAvatarUpload = (file: File) => {
  const isImg = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImg) ElMessage.error('只能上传图片')
  if (!isLt2M) ElMessage.error('图片不能超过 2MB')
  return isImg && isLt2M
}

// 上传头像
const uploadAvatar = async ({ file }: { file: File }) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await uploadAvatarService(formData)
  if (res.code === 0) {
    ElMessage.success('头像上传成功')
    await fetchUser()
  } else {
    ElMessage.error(res.message || '头像上传失败')
  }
}

const router = useRouter()
const toUpdatePwd = () => router.push('/user/updatePassword')
</script>

<style scoped>
.user-info-card {
  max-width: 600px;
  margin: 30px auto;
}
</style>
