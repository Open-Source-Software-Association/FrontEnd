<template>
  <div class="permission-container">
    <!-- 权限表格 -->
    <el-card>
      <el-button type="primary" @click="openAssignDialog">分配权限</el-button>
      <el-table :data="permissionList" border style="width: 100%">
        <el-table-column prop="permissionName" label="权限名称" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button
                size="small"
                @click="toggleStatus(row)"
                :type="row.status ? 'danger' : 'success'"
            >
              {{ row.status ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          @current-change="loadPermissions"
          layout="total, prev, pager, next"
          class="mt-4"
      />
    </el-card>

    <!-- 分配权限弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="分配权限" width="600px">
      <el-form :model="assignForm" label-width="80px">
        <!-- 用户搜索 -->
        <el-form-item label="选择用户">
          <el-input
              v-model="searchKeyword"
              placeholder="输入姓名或工号搜索"
              @input="handleSearchUser"
              clearable
          />
          <el-table
              :data="userList"
              border
              class="mt-2"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="nickName" label="姓名" />
            <el-table-column prop="jobNumber" label="工号" />
            <el-table-column prop="phone" label="手机号" />
          </el-table>
          <el-pagination
              small
              layout="prev, pager, next"
              :total="userTotal"
              @current-change="loadUsers"
              class="mt-2"
          />
        </el-form-item>

        <!-- 权限选择 -->
        <el-form-item label="选择权限">
          <el-select
              v-model="assignForm.permissionId"
              placeholder="请选择权限"
              filterable
          >
            <el-option
                v-for="item in permissionOptions"
                :key="item.permissionId"
                :label="item.permissionName"
                :value="item.permissionId"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getAllPermissions,
  disablePermission,
  enablePermission,
  assignPermission
} from '@/apis/permissions'
import { searchUsersService } from '@/apis/users'
import type {
  PermissionsVO
} from '@/types/permissions'
import type {
  InfoVO
} from '@/types/users'

// 类型定义
interface PermissionItem extends PermissionsVO {
  permissionId: number
}

// 权限列表状态
const permissionList = ref<PermissionItem[]>([])
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 分配权限相关状态
const assignDialogVisible = ref(false)
const assignForm = reactive({
  permissionId: undefined as number | undefined, // ✅ 明确类型
  userIds: [] as number[]
})

// 用户搜索相关状态
const searchKeyword = ref('')
const userList = ref<InfoVO[]>([])
const userTotal = ref(0)

// 权限选项
const permissionOptions = ref<PermissionItem[]>([])

// 加载权限列表
const loadPermissions = async (pageNum: number = pagination.current) => {
  try {
    const res = await getAllPermissions({
      pageNum,
      pageSize: pagination.size
    })
    permissionList.value = res.data.records
    pagination.total = res.data.total ?? 0 // ✅ 使用空值合并
  } catch (error) {
    ElMessage.error('加载权限列表失败')
  }
}

// 加载权限选项
const loadPermissionOptions = async () => {
  try {
    const res = await getAllPermissions({ pageNum: 1, pageSize: 100 })
    permissionOptions.value = res.data.records
  } catch (error) {
    ElMessage.error('加载权限选项失败')
  }
}

// 切换权限状态
const toggleStatus = async (row: PermissionItem) => {
  try {
    if (row.status) {
      await disablePermission(row.permissionId)
    } else {
      await enablePermission(row.permissionId)
    }
    ElMessage.success('状态更新成功')
    await loadPermissions()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

// 用户搜索处理（带防抖）
let searchTimer: number
const handleSearchUser = () => {
  clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    loadUsers(1)
  }, 500)
}

// 加载用户列表
const loadUsers = async (page: number) => {
  try {
    const keyword = searchKeyword.value.trim() || ''
    const res = await searchUsersService(
        keyword, {
          pageNum: page,
          pageSize: 5
        })
    userList.value = res.data.records
    userTotal.value = res.data.total ?? 0 // ✅ 使用空值合并
  } catch (error) {
    ElMessage.error('加载用户失败')
  }
}

// 用户选择处理
const handleSelectionChange = (users: InfoVO[]) => {
  assignForm.userIds = users.map(u => u.userId)
}

// 分配权限提交
const handleAssign = async () => {
  if (!assignForm.permissionId) {
    return ElMessage.warning('请选择权限')
  }
  if (assignForm.userIds.length === 0) {
    return ElMessage.warning('请选择至少一个用户')
  }

  try {
    await Promise.all(
        assignForm.userIds.map(userId =>
            assignPermission({ userId, permissionId: assignForm.permissionId! }) // ✅ 明确类型
        )
    )
    ElMessage.success('权限分配成功')
    assignDialogVisible.value = false
    await loadPermissions()
  } catch (error) {
    console.error('分配失败:', error)
    ElMessage.error('分配失败')
  }
}

// 打开分配权限弹窗
const openAssignDialog = () => {
  assignDialogVisible.value = true
}

// 初始化加载
onMounted(() => {
  loadPermissions()
  loadPermissionOptions()
})
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.mt-2 {
  margin-top: 10px;
}
</style>