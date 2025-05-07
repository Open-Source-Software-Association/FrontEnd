<template>
  <el-dialog
      :model-value="visible"
      @update:modelValue="emit('update:visible', $event)"
      :title="`部门成员信息 - ${department?.departmentName || ''}`"
      width="80%"
  >
    <div style="margin-bottom: 10px; display: flex; justify-content: space-between;">
      <div>
        <el-button type="primary">添加成员</el-button>
        <el-button type="danger">删除成员</el-button>
      </div>
      <div>
        <el-button type="success" @click="handleImport">导入成员</el-button>
        <el-button @click="handleExport">导出成员</el-button>
      </div>
    </div>
    <el-table :data="departmentMembers" v-loading="loading" style="width: 100%;">
      <el-table-column prop="jobNumber" label="工号" />
      <el-table-column prop="nickName" label="姓名" />
      <el-table-column prop="college" label="学院" />
      <el-table-column prop="major" label="专业" />
      <el-table-column prop="grade" label="年级" />
      <el-table-column prop="roleName" label="角色" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDepartmentMembersService, importDepartmentMembersService, exportDepartmentMembersService } from '@/apis/clubMember'
import type { ClubMemberFullInfoVO } from '@/types/member'
import type { DepartmentsVO } from '@/types/department'

const props = defineProps<{
  visible: boolean
  clubId: number
  department: DepartmentsVO
}>()
const emit = defineEmits(['update:visible'])

const departmentMembers = ref<ClubMemberFullInfoVO[]>([])
const loading = ref(false)

const loadMembers = async () => {
  loading.value = true
  const res = await getDepartmentMembersService(props.department.clubId, props.department.departmentId, 1, 1000)
  loading.value = false
  if (res.data.code === 0 || res.data.code === 200) {
    departmentMembers.value = res.data.data.records
  } else {
    ElMessage.error(res.data.message || '获取失败')
  }
}

watch(() => props.visible, (val) => {
  if (val) loadMembers()
})

const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xls,.xlsx'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const res = await importDepartmentMembersService(props.clubId, props.department.departmentId, file)
    if (res.data.code === 0) {
      ElMessage.success('导入成功')
      loadMembers()
    } else {
      ElMessage.error(res.data.message || '导入失败')
    }
  }
  input.click()
}

const handleExport = async () => {
  const res = await exportDepartmentMembersService(props.clubId, props.department.departmentId)
  const blob = res.data
  const text = await blob.text()
  try {
    const json = JSON.parse(text)
    ElMessage.error(json.message || '导出失败')
  } catch {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '部门成员.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }
}
</script>

<style scoped>
</style>