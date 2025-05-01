<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAllRolesService,
  assignRoleService
} from '@/apis/roles'
import { getUsersByRoleIdService, searchUsersService } from "@/apis/users"
import type { RolesVO, AssignRoleDTO } from '@/types/roles'
import type { UserWithRoleVO } from '@/types/users'
import { Search } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

// 类型定义
interface UserItem extends UserWithRoleVO {
  roleName: string
  roleId: number
}

// 数据状态
const roles = ref<RolesVO[]>([])
const currentRoleId = ref<number>()
const users = ref<UserItem[]>([])
const selectedUsers = ref<UserItem[]>([])
const targetRoleId = ref<number>()
const nameSearchKeyword = ref('')

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const loading = reactive({
  roles: false,
  users: false,
  assigning: false
})

// 获取所有角色
const fetchRoles = async () => {
  try {
    loading.roles = true
    const res = await getAllRolesService()
    roles.value = res.data.records
  } finally {
    loading.roles = false
  }
}

// 统一数据获取方法
const fetchUsers = async () => {
  try {
    loading.users = true

    if (nameSearchKeyword.value) {
      // 姓名搜索
      const res = await searchUsersService(
          nameSearchKeyword.value.trim(),
          {
            pageNum: pagination.pageNum,
            pageSize: pagination.pageSize
          }
      )

      users.value = res.data.records.map(user => ({
        ...user,
        roleName: getRoleNameById(user.roleId),
        roleId: user.roleId
      }))

      pagination.total = res.data.total?? 0
    }
    else if (currentRoleId.value) {
      // 角色筛选
      const res = await getUsersByRoleIdService(currentRoleId.value, {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize
      })

      users.value = res.data.records.map(user => ({
        ...user,
        roleName: getRoleNameById(user.roleId),
        roleId: user.roleId
      }))

      pagination.total = res.data.total?? 0
    }
    else {
      resetUserList()
    }
  } catch (error) {
    handleError(error, '用户数据加载失败')
    resetUserList()
  } finally {
    loading.users = false
  }
}

// 重置用户列表
const resetUserList = () => {
  users.value = []
  pagination.total = 0
}

// 自动触发数据加载
watchEffect(() => {
  if (nameSearchKeyword.value || currentRoleId.value) {
    pagination.pageNum = 1
    fetchUsers()
  }
})

// 处理角色选择
const handleRoleChange = (roleId: number) => {
  currentRoleId.value = roleId
  nameSearchKeyword.value = ''
}

// 防抖处理姓名搜索
const debouncedHandleNameSearch = debounce(() => {
  fetchUsers()
}, 300)

const handleNameSearch = () => {
  currentRoleId.value = undefined
  debouncedHandleNameSearch()
}

// 分页变化处理
const handlePaginationChange = (newPage: number) => {
  pagination.pageNum = newPage
  fetchUsers()
}

// 页尺寸变化处理
const handlePageSizeChange = (newSize: number) => {
  pagination.pageSize = newSize
  pagination.pageNum = 1
  fetchUsers()
}

// 批量分配角色
const handleBatchAssign = async () => {
  if (!targetRoleId.value) {
    ElMessage.warning('请选择目标角色')
    return
  }
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请至少选择一个用户')
    return
  }

  try {
    loading.assigning = true

    await ElMessageBox.confirm(
        `确定将选中的 ${selectedUsers.value.length} 个用户分配到 ${getRoleNameById(targetRoleId.value)} 角色吗？`,
        '分配确认',
        { type: 'warning' }
    )

    // 构建批量请求体
    const assignPromises = selectedUsers.value.map(user =>
        assignRoleService({
          userId: user.userId,
          roleId: targetRoleId.value!
        } as AssignRoleDTO)
    )

    await Promise.all(assignPromises)

    ElMessage.success(`成功分配 ${selectedUsers.value.length} 个用户`)
    selectedUsers.value = []
    await fetchUsers()
  } catch (error) {
    handleError(error, '角色分配失败')
  } finally {
    loading.assigning = false
  }
}

// 获取角色名称
const getRoleNameById = (roleId: number): string => {
  return roles.value.find(r => r.roleId === roleId)?.roleName || '未知角色'
}

// 错误处理函数
const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  ElMessage.error(message)
}

// 初始化
onMounted(fetchRoles)
</script>

<template>
  <div class="role-management">
    <!-- 搜索和筛选区域 -->
    <div class="filter-area">
      <el-input
          v-model="nameSearchKeyword"
          placeholder="输入姓名搜索用户"
          clearable
          style="width: 300px; margin-right: 15px;"
          @keyup.enter="handleNameSearch"
      >
        <template #append>
          <el-button
              type="primary"
              :icon="Search"
              @click="handleNameSearch"
              :loading="loading.users"
          />
        </template>
      </el-input>

      <el-select
          v-model="currentRoleId"
          placeholder="选择角色筛选"
          clearable
          style="width: 250px;"
          @change="handleRoleChange"
      >
        <el-option
            v-for="role in roles"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
        />
      </el-select>
    </div>

    <!-- 用户表格 -->
    <el-table
        v-loading="loading.users"
        :data="users"
        @selection-change="val => selectedUsers = val"
        style="margin-top: 20px;"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="userId" label="用户ID" width="120" align="center" />
      <el-table-column prop="nickName" label="用户昵称" min-width="180" />
      <el-table-column label="所属角色" width="200">
        <template #default="{ row }">
          <el-tag effect="plain">
            {{ row.roleName }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @current-change="handlePaginationChange"
        @size-change="handlePageSizeChange"
        style="margin-top: 20px;"
    />

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedUsers.length > 0">
      <el-select
          v-model="targetRoleId"
          placeholder="选择分配角色"
          style="width: 250px; margin-right: 15px;"
      >
        <el-option
            v-for="role in roles"
            :key="role.roleId"
            :label="role.roleName"
            :value="role.roleId"
        />
      </el-select>
      <el-button
          type="primary"
          :loading="loading.assigning"
          :disabled="!targetRoleId"
          @click="handleBatchAssign"
      >
        批量分配 ({{ selectedUsers.length }})
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.role-management {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-area {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.batch-actions {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .filter-area {
    flex-direction: column;
    gap: 10px;
  }

  .filter-area > * {
    width: 100% !important;
  }
}
</style>