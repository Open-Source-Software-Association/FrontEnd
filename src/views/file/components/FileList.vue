<template>
  <div class="file-list">
    <el-table :data="files" v-loading="loading" style="width: 100%">
      <el-table-column prop="fileName" label="文件名" width="300">
        <template #default="{ row }">
          <div class="file-name-cell">
            <el-icon :size="20" :color="getFileIconColor(row.fileType)">
              <component :is="getFileIcon(row.fileType)" />
            </el-icon>
            <span class="name" :title="row.fileName">{{ row.fileName }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="uploadedByName" label="上传者" width="120" />

      <el-table-column prop="uploadTime" label="上传时间" width="180">
        <template #default="{ row }">
          {{ row.createdAt || '未知' }}
        </template>
      </el-table-column>

      <el-table-column prop="size" label="大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="$emit('preview', row)">预览</el-button>
          <el-button size="small" type="danger" @click="$emit('delete', row.fileId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { FileType, FilesVO } from '@/types/files'
import {
  Picture as ElIconPicture,
  VideoCamera as ElIconVideoCamera,
  Headset as ElIconHeadset,
  Document as ElIconDocument,
  Files as ElIconFiles
} from '@element-plus/icons-vue'

export default defineComponent({
  name: 'FileList',
  components: {
    ElIconPicture,
    ElIconVideoCamera,
    ElIconHeadset,
    ElIconDocument,
    ElIconFiles
  },
  props: {
    files: {
      type: Array as PropType<FilesVO[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['preview', 'delete'],
  setup() {
    const getFileIcon = (type: FileType) => {
      switch (type) {
        case FileType.IMAGE: return 'el-icon-picture'
        case FileType.VIDEO: return 'el-icon-video-camera'
        case FileType.AUDIO: return 'el-icon-headset'
        case FileType.DOCUMENT: return 'el-icon-document'
        default: return 'el-icon-files'
      }
    }

    const getFileIconColor = (type: FileType) => {
      switch (type) {
        case FileType.IMAGE: return '#67C23A'
        case FileType.VIDEO: return '#409EFF'
        case FileType.AUDIO: return '#E6A23C'
        case FileType.DOCUMENT: return '#F56C6C'
        default: return '#909399'
      }
    }

    const formatFileSize = (bytes?: number) => {
      if (!bytes) return '未知'
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }

    return {
      getFileIcon,
      getFileIconColor,
      formatFileSize
    }
  }
})
</script>

<style scoped>
.file-name-cell {
  display: flex;
  align-items: center;
}

.file-name-cell .name {
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>