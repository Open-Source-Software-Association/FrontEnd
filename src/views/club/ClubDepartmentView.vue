<template>
  <el-card class="form-card">
    <template #header>
      <div style="display: flex; align-items: center; gap: 12px;">
        <strong>社团：</strong>{{ club?.clubName || '加载中...' }}　
        <strong>创建人：</strong>{{ club?.founderUserName || '加载中...' }}
        <el-button type="primary" size="large" style="margin-left: 20px;" @click="showMembers = true">
          查看社团成员
        </el-button>
      </div>
    </template>

    <div><strong>简介：</strong>{{ club?.description || '暂无' }}</div>

    <hr style="margin: 16px 0;" />

    <div style="margin-bottom: 10px;">
      <el-input v-model="keyword" placeholder="请输入关键词" style="width: 200px; margin-right: 10px;" />
      <el-button type="primary" @click="fetchDepartments">搜索</el-button>
      <el-button type="success" @click="createDepartment">创建部门</el-button>
    </div>

    <el-table
        :data="departmentList"
        v-loading="loading"
        stripe
        style="width: 100%;"
        class="centered-table"
    >
      <el-table-column prop="departmentName" label="部门名称" align="center" />
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column label="操作" width="280" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="toManageMembers(row)">成员管理</el-button>
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

    <!-- 社团成员弹窗 -->
    <el-dialog v-model="showMembers" title="社团成员信息" width="80%">
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
      <el-table :data="clubMembers" v-loading="loadingMembers" style="width: 100%;" class="centered-table">
        <el-table-column prop="jobNumber" label="工号" align="center" />
        <el-table-column prop="nickName" label="姓名" align="center" />
        <el-table-column prop="college" label="学院" align="center" />
        <el-table-column prop="major" label="专业" align="center" />
        <el-table-column prop="grade" label="年级" align="center" />
        <el-table-column prop="roleName" label="角色" align="center" />
        <el-table-column prop="departmentName" label="所属部门" align="center" />
      </el-table>
    </el-dialog>

    <!-- 创建部门弹窗 -->
    <el-dialog v-model="showCreateDialog" title="创建部门" width="400px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="80px">
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="createForm.departmentName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>

    <!-- 部门成员弹窗 -->
    <DepartmentMemberDialog
        :club-id="clubId"
        :department="selectedDepartment"
        v-model:visible="showDepartmentMembers"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getDepartmentsByClubIdService,
  disableDepartmentService,
  createDepartmentService
} from '@/apis/department'
import { getClubByIdService } from '@/apis/club'
import {
  getClubMembersService,
  importDepartmentMembersService,
  exportClubMembersService
} from '@/apis/clubMember'
import DepartmentMemberDialog from './components/DepartmentMemberDialog.vue'
import type { CreateDepartmentDTO, DepartmentsVO } from '@/types/department'
import type { ClubVO } from '@/types/club'
import type { ClubMemberFullInfoVO } from '@/types/member'
import type { FormInstance } from 'element-plus'

const route = useRoute()
const clubId = Number(route.params.clubId)

const club = ref<ClubVO>()
const departmentList = ref<DepartmentsVO[]>([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const keyword = ref('')

const showMembers = ref(false)
const clubMembers = ref<ClubMemberFullInfoVO[]>([])
const loadingMembers = ref(false)

const selectedDepartment = ref<DepartmentsVO | null>(null)
const showDepartmentMembers = ref(false)

const fetchClubInfo = async () => {
  const res = await getClubByIdService(clubId)
  if (res.data.code === 0 || res.data.code === 200) {
    club.value = res.data.data
  } else {
    ElMessage.error(res.data.message || '获取社团信息失败')
  }
}

const fetchDepartments = async () => {
  loading.value = true
  const res = await getDepartmentsByClubIdService(
      clubId,
      pageNum.value,
      pageSize.value,
      keyword.value.trim()
  )
  loading.value = false
  if (res.data.code === 0 || res.data.code === 200) {
    departmentList.value = res.data.data.records
    total.value = res.data.data.total
  } else {
    ElMessage.error(res.data.message || '获取部门失败')
  }
}

watch(showMembers, async (val) => {
  if (val) {
    loadingMembers.value = true
    const res = await getClubMembersService(clubId, 1, 1000)
    loadingMembers.value = false
    if (res.data.code === 0 || res.data.code === 200) {
      clubMembers.value = res.data.data.records
    } else {
      ElMessage.error(res.data.message || '获取成员失败')
    }
  }
})

const handleImport = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xls,.xlsx'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const res = await importDepartmentMembersService(clubId, 0, file)
    if (res.data.code === 0) {
      ElMessage.success('导入成功')
      showMembers.value = false
    } else {
      ElMessage.error(res.data.message || '导入失败')
    }
  }
  input.click()
}

const handleExport = async () => {
  const res = await exportClubMembersService(clubId)
  const blob = res.data
  const text = await blob.text()
  try {
    const json = JSON.parse(text)
    ElMessage.error(json.message || '导出失败：后端返回错误信息')
    return
  } catch {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '社团成员.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }
}

const disable = async (row: DepartmentsVO) => {
  await disableDepartmentService(row.departmentId)
  ElMessage.success('已禁用')
  fetchDepartments()
}

const createDepartment = () => {
  showCreateDialog.value = true
}

const showCreateDialog = ref(false)
const createForm = ref<CreateDepartmentDTO>({
  clubId: clubId,
  departmentName: '',
  description: ''
})
const createFormRef = ref<FormInstance>()

const createRules = {
  departmentName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const submitCreate = async () => {
  await createFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const res = await createDepartmentService(createForm.value)
      if (res.data.code === 0 || res.data.code === 200) {
        ElMessage.success('创建成功')
        showCreateDialog.value = false
        createForm.value.departmentName = ''
        createForm.value.description = ''
        fetchDepartments()
      } else {
        ElMessage.error(res.data.message || '创建失败')
      }
    }
  })
}

const toManageMembers = (row: DepartmentsVO) => {
  selectedDepartment.value = row
  showDepartmentMembers.value = true
}

onMounted(() => {
  fetchClubInfo()
  fetchDepartments()
})
</script>

<style scoped>
.form-card {
  padding: 16px;
}

.centered-table .el-table__cell {
  text-align: center;
}

.centered-table thead th {
  font-weight: bold !important;
  text-align: center !important;
}
</style>
