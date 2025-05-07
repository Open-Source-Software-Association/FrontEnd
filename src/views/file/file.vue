<template>
  <div class="file-management">
    <!-- 顶部标题和操作区 -->
    <div class="header">
      <div class="header-left">
        <h2>社团文件管理</h2>
        <div class="club-info">
          <el-tag type="info" size="large">
            <el-icon><User /></el-icon>
            <span class="club-name">{{ club?.clubName || '加载中...' }}</span>
          </el-tag>
        </div>
      </div>
      <el-button
          type="primary"
          @click="showUploadModal = true"
          :icon="Upload"
      >
        上传文件
      </el-button>
    </div>

    <!-- 文件分类标签页 -->
    <el-tabs v-model="activeTab" type="border-card" class="file-tabs">
      <el-tab-pane label="全部文件" name="all">
        <FileList
            :files="filteredFiles"
            :loading="loading"
            @preview="handlePreview"
            @delete="handleDelete"
        />
      </el-tab-pane>
      <el-tab-pane
          v-for="type in fileTypes"
          :key="type.value"
          :label="type.label"
          :name="type.value.toString()"
      >
        <FileList
            :files="filesByType(type.value)"
            :loading="loading"
            @preview="handlePreview"
            @delete="handleDelete"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 分页控件 -->
    <div class="pagination">
      <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
      />
    </div>

    <!-- 上传文件模态框 -->
    <FileUploadModal
        v-if="showUploadModal"
        :clubId="clubId"
        v-model="showUploadModal"
        @success="handleUploadSuccess"
    />

    <!-- 文件预览模态框 -->
    <FilePreviewModal
        v-if="previewFile"
        :file="previewFile"
        @close="previewFile = null"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Upload } from '@element-plus/icons-vue'
import FileUploadModal from './components/FileUploadModal.vue'
import FilePreviewModal from './components/FilePreviewModal.vue'
import FileList from './components/FileList.vue'
import { FilesVO, FileType } from '@/types/files'
import { getFilesByClubIdService, deleteFileService } from '@/apis/files'
import { getClubByIdService } from '@/apis/club'
import type { ClubVO } from '@/types/club'

const route = useRoute()
const clubId = Number(route.params.clubId)

// 状态管理
const loading = ref(false)
const files = ref<FilesVO[]>([])
const previewFile = ref<FilesVO | null>(null)
const showUploadModal = ref(false)
const activeTab = ref('all')
const club = ref<ClubVO>()

const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

const fileTypes = [
  { value: FileType.IMAGE, label: '图片' },
  { value: FileType.VIDEO, label: '视频' },
  { value: FileType.AUDIO, label: '音频' },
  { value: FileType.DOCUMENT, label: '文档' },
  { value: FileType.OTHER, label: '其他' }
]

// 计算属性
const filteredFiles = computed(() => files.value)
const filesByType = (type: FileType) => files.value.filter(file => file.fileType === type)

// 方法
const fetchClubInfo = async () => {
  try {
    const res = await getClubByIdService(clubId)
    if (res.data?.code === 200 || res.data?.code === 0) {
      club.value = res.data.data
    } else {
      ElMessage.error(res.data?.message || '获取社团信息失败')
    }
  } catch (error) {
    ElMessage.error('获取社团信息失败')
    console.error(error)
  }
}

const fetchFiles = async () => {
  try {
    loading.value = true
    const res = await getFilesByClubIdService(clubId, {
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    })
    if (res.code === 200 && res.data) {
      files.value = res.data.records
      pagination.value.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess = () => {
  showUploadModal.value = false
  fetchFiles()
  ElMessage.success('文件上传成功')
}

const handlePreview = (file: FilesVO) => {
  previewFile.value = file
}

const handleDelete = async (fileId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文件吗？删除后无法恢复', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })
    const res = await deleteFileService(fileId)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchFiles()
    }
  } catch (error) {
    console.log('取消删除')
  }
}

const handleSizeChange = (size: number) => {
  pagination.value.size = size
  fetchFiles()
}

const handleCurrentChange = (current: number) => {
  pagination.value.current = current
  fetchFiles()
}

// 生命周期
onMounted(() => {
  fetchFiles()
  fetchClubInfo()
})
</script>

<style scoped>
.file-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.club-info {
  display: flex;
  align-items: center;
}

.club-name {
  margin-left: 8px;
  font-weight: 500;
}

.file-tabs {
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-tabs--border-card {
  background: #fff;
}

:deep(.el-tabs__header) {
  background-color: #f5f7fa;
}

:deep(.el-tabs__item) {
  font-weight: 500;
}
</style>