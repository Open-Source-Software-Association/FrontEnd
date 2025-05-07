<template>
  <el-card>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input v-model="form.activityName" placeholder="请输入活动名称" />
      </el-form-item>

      <el-form-item label="活动描述" prop="description">
        <el-input type="textarea" v-model="form.description" placeholder="请输入活动描述" />
      </el-form-item>

      <el-form-item label="起始时间" prop="startTime">
        <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="活动地点" prop="location">
        <el-input v-model="form.location" placeholder="请输入活动地点" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createClubActivityService } from '@/apis/clubActivity'
import type { FormInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()
const clubId = Number(route.params.clubId)

const form = ref({
  clubId,
  activityName: '',
  description: '',
  startTime: '',
  endTime: '',
  location: ''
})

const rules = {
  activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }]
}

const formRef = ref<FormInstance>()

const submit = async () => {
  await formRef.value?.validate()
  const res = await createClubActivityService(form.value)
  if (res.code === 200||res.code === 0) {
    ElMessage.success('创建成功')
    router.push('/activity/list')

  } else {
    ElMessage.error(res.message || '创建失败')
  }
}

const reset = () => {
  form.value.activityName = ''
  form.value.description = ''
  form.value.startTime = ''
  form.value.endTime = ''
  form.value.location = ''
}
</script>
