<template>
  <el-card>
    <template #header>
      <div class="header-container">
        <span>社团活动管理</span>
        <el-button type="primary" @click="goToCreate" plain>+ 创建活动</el-button>
      </div>
    </template>

    <div class="filter-section">
      <el-input
          v-model="keyword"
          placeholder="搜索活动名称"
          style="width: 240px"
          clearable
          @clear="handleSearch"
          @keyup.enter.native="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table
        :data="activities"
        border
        v-loading="loading"
        style="width: 100%"
        class="centered-table"
    >
      <el-table-column prop="activityId" label="ID" width="80" align="center" />
      <el-table-column prop="activityName" label="活动名称" align="center" />
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column prop="location" label="地点" align="center" />
      <el-table-column label="开始时间" align="center">
        <template #default="{ row }">
          {{ formatTime(row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center">
        <template #default="{ row }">
          {{ formatTime(row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="showActivityDetails(row)">查看</el-button>
          <el-button size="small" type="danger" @click="deleteActivity(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, sizes"
          :page-sizes="[5, 10, 20, 50]"
          @current-change="fetchList"
          @size-change="fetchList"
      />
    </div>
  </el-card>

  <!-- 活动详情弹窗 -->
  <el-dialog v-model="dialogVisible" title="活动详情" width="600px">
    <el-descriptions v-if="currentActivity" :column="1" border>
      <el-descriptions-item label="活动名称">
        {{ currentActivity.activityName }}
      </el-descriptions-item>
      <el-descriptions-item label="活动描述">
        {{ currentActivity.description }}
      </el-descriptions-item>
      <el-descriptions-item label="地点">
        {{ currentActivity.location }}
      </el-descriptions-item>
      <el-descriptions-item label="开始时间">
        {{ formatTime(currentActivity.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        {{ formatTime(currentActivity.endTime) }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getClubActivitiesByClubIdService,
  deleteClubActivityService
} from '@/apis/clubActivity'
import type { ClubActivityVO } from '@/types/activity'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const activities = ref<ClubActivityVO[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const clubId = 1 // 可替换为动态获取

const dialogVisible = ref(false)
const currentActivity = ref<ClubActivityVO | null>(null)

const showActivityDetails = (row: ClubActivityVO) => {
  currentActivity.value = row
  dialogVisible.value = true
}

const fetchList = async () => {
  loading.value = true
  const res = await getClubActivitiesByClubIdService(
      clubId,
      pageNum.value,
      pageSize.value,
      keyword.value.trim()
  )
  loading.value = false
  if (res.code === 0 || res.code === 200) {
    activities.value = res.data.records
    total.value = res.data.total
  } else {
    ElMessage.error(res.message || '获取失败')
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchList()
}

const goToCreate = () => {
  router.push(`/club/${clubId}/activity/create`)
}

const deleteActivity = async (row: ClubActivityVO) => {
  try {
    await ElMessageBox.confirm(`确定要删除活动「${row.activityName}」吗？`, '警告', {
      type: 'warning'
    })
    const res = await deleteClubActivityService(row.activityId)
    if (res.code === 0 || res.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 时间格式化
const formatTime = (val: string) => {
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'
}

onMounted(fetchList)
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-section {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 表格内容居中 */
.centered-table .el-table__cell {
  text-align: center;
}

/* 表头加粗 + 居中 */
.centered-table thead th {
  font-weight: bold;
  text-align: center;
}
</style>
