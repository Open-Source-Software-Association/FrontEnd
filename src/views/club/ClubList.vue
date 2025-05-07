<template>
  <div class="club-list">
    <div class="toolbar">
      <el-input
          v-model="keyword"
          placeholder="请输入社团名称关键词"
          clearable
          @clear="fetchClubs"
          @keyup.enter="fetchClubs"
          style="width: 250px;"
      />
      <el-button type="primary" @click="fetchClubs">搜索</el-button>
      <el-button type="success" @click="toCreateClub">创建社团</el-button>
    </div>

    <el-table
        :data="clubList"
        stripe
        style="width: 100%; margin-top: 16px;"
        class="centered-table"
    >
      <el-table-column prop="clubId" label="ID" width="80" align="center" />
      <el-table-column prop="clubName" label="社团名称" align="center" />
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column prop="founderUserName" label="创建人" align="center" />
      <el-table-column label="Logo" width="100" align="center">
        <template #default="{ row }">
          <el-image
              v-if="row.logoUrl"
              :src="row.logoUrl"
              :preview-src-list="[row.logoUrl]"
              style="width: 60px; height: 60px;"
              fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="toEdit(row.clubId)">编辑</el-button>
          <el-button size="small" type="info" @click="viewClub(row.clubId)">查看</el-button>
          <el-button
              size="small"
              :type="row.enabled ? 'danger' : 'success'"
              @click="toggleStatus(row)"
          >
            {{ row.enabled ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next, jumper"
        @current-change="fetchClubs"
        @size-change="fetchClubs"
        background
        style="margin-top: 16px;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClubListService, disableClubService, enableClubService } from '@/apis/club'
import { useRouter } from 'vue-router'
import type { ClubVO } from '@/types/club'
import type { AxiosResponse } from 'axios'

const keyword = ref('')
const clubList = ref<(ClubVO & { enabled?: boolean })[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const router = useRouter()

const fetchClubs = async () => {
  try {
    const res: AxiosResponse = await getClubListService({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim()
    })

    const result = res.data
    if (result.code === 0 || result.code === 200) {
      const records: ClubVO[] = result.data?.records || []
      clubList.value = records.map(item => ({
        ...item,
        enabled: true
      }))
      total.value = result.data?.total ?? 0
    } else {
      ElMessage.error(result.message || '获取社团列表失败')
    }
  } catch (err) {
    console.error('请求异常:', err)
    ElMessage.error('网络错误，获取社团列表失败')
  }
}

const toCreateClub = () => {
  router.push('/club/create')
}

const toEdit = (id: number) => {
  router.push(`/club/edit/${id}`)
}

const toggleStatus = async (club: ClubVO & { enabled?: boolean }) => {
  const action = club.enabled ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}该社团？`, '提示', {
      type: 'warning'
    })

    const res: AxiosResponse = club.enabled
        ? await disableClubService(club.clubId)
        : await enableClubService(club.clubId)

    const result = res.data
    if (result.code === 0 || result.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchClubs()
    } else {
      ElMessage.error(result.message || `${action}失败`)
    }
  } catch {}
}

const viewClub = (clubId: number) => {
  router.push(`/club/${clubId}/department`)
}

onMounted(fetchClubs)
</script>

<style scoped>
.club-list {
  padding: 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.centered-table .el-table__cell {
  text-align: center;
}
.centered-table thead th {
  font-weight: bold !important;
  text-align: center !important;
}
</style>
