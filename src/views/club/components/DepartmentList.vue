<!-- src/views/club/components/DepartmentList.vue -->

<template>
  <div>
    <div style="margin-bottom: 10px;">
      <el-input v-model="keyword" placeholder="请输入关键词" style="width: 200px; margin-right: 10px;" />
      <el-button type="primary" @click="fetchDepartments">搜索</el-button>
      <el-button type="success" @click="createDepartment">创建部门</el-button>
    </div>

    <el-table :data="departmentList" v-loading="loading" stripe style="width: 100%;">
      <el-table-column prop="departmentName" label="部门名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="disable(row)">禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="fetchDepartments"
        @size-change="fetchDepartments"
        style="margin-top: 16px;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDepartmentsByClubIdService, disableDepartmentService } from '@/apis/department'
import type { DepartmentsVO } from '@/types/department'


const props = defineProps<{ clubId: number }>()
const departmentList = ref<DepartmentsVO[]>([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const keyword = ref('')

const fetchDepartments = async () => {
  loading.value = true
  const res = await getDepartmentsByClubIdService(props.clubId, pageNum.value, pageSize.value, keyword.value)
  loading.value = false
  if (res.data.code === 0 || res.data.code === 200) {
    departmentList.value = res.data.data.records
    total.value = res.data.data.total
  } else {
    ElMessage.error(res.data.message || '获取失败')
  }
}


const disable = async (row: DepartmentsVO) => {
  await disableDepartmentService(row.departmentId)
  ElMessage.success('已禁用')
  fetchDepartments()
}

const createDepartment = () => {
  ElMessage.info('创建部门功能待实现')
}

watch(() => props.clubId, fetchDepartments, { immediate: true })
</script>
