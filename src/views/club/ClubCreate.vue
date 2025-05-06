<template>
  <el-card class="form-card">
    <template #header>
      <div class="card-header">创建社团</div>
    </template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="社团名称" prop="clubName">
        <el-input v-model="form.clubName" placeholder="请输入社团名称" />
      </el-form-item>

      <el-form-item label="简介" prop="description">
        <el-input v-model="form.description" type="textarea" placeholder="请输入简介" />
      </el-form-item>

      <el-form-item label="会长" prop="founderUserId">
        <el-select v-model="form.founderUserId" placeholder="请选择会长">
          <el-option
              v-for="member in memberList"
              :key="member.userId"
              :label="member.nickName"
              :value="member.userId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="上传 Logo">
        <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadLogo"
        >
          <el-button type="primary">上传 Logo</el-button>
        </el-upload>
        <el-image
            v-if="logoUrl"
            :src="logoUrl"
            style="margin-top: 10px; width: 100px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleCreate">提交</el-button>
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createClubService, uploadClubFileService, getClubMemberListService } from '@/apis/club'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const formRef = ref()
const authStore = useAuthStore()

const form = ref({
  clubName: '',
  description: '',
  founderUserId: undefined
})

const logoUrl = ref('')
const logoFile = ref<File | null>(null)
const memberList = ref<{ userId: number, nickName: string }[]>([])

const rules = {
  clubName: [{ required: true, message: '请输入社团名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  founderUserId: [{ required: true, message: '请选择会长', trigger: 'change' }]
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('只能上传图片')
  if (!isLt2M) ElMessage.error('大小不能超过2MB')
  if (isImage && isLt2M) logoFile.value = file
  return isImage && isLt2M
}

// 提交创建逻辑
const handleCreate = async () => {
  await formRef.value.validate()
  const res = await createClubService(form.value)

  if (res.data?.code === 0 || res.data?.code === 200) {
    const clubId = res.data.data
    ElMessage.success('社团创建成功')

    // 若存在 logo 文件，立即上传
    if (logoFile.value) {
      const formData = new FormData()
      formData.append('file', logoFile.value)

      const uploadRes = await uploadClubFileService(clubId, formData)
      if (uploadRes.data?.code === 0 || uploadRes.data?.code === 200) {
        ElMessage.success('Logo 上传成功')
        logoUrl.value = uploadRes.data?.data?.fileUrl || ''
      } else {
        ElMessage.warning('社团已创建，但 Logo 上传失败')
      }
    }

    router.push('/club/list')
  } else {
    ElMessage.error(res.data?.message || '社团创建失败')
  }
}

// 获取成员列表作为候选会长
const fetchMembers = async () => {
  const res = await getClubMemberListService()
  if (res.data?.code === 0) {
    memberList.value = res.data.data || []
  } else {
    ElMessage.warning('加载成员列表失败')
  }
}

onMounted(fetchMembers)
</script>

<style scoped>
.form-card {
  max-width: 600px;
  margin: 30px auto;
}
</style>
