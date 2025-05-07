<template>
  <el-dialog
      :title="file.fileName"
      v-model="visible"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
  >
    <div class="preview-container">
      <div v-if="isImage" class="image-preview">
        <el-image
            :src="fileUrl"
            :preview-src-list="[fileUrl]"
            fit="contain"
            style="max-height: 70vh;"
        />
      </div>

      <div v-else-if="isVideo" class="video-preview">
        <video controls style="max-width: 100%; max-height: 70vh;">
          <source :src="fileUrl" :type="videoType">
          您的浏览器不支持视频播放
        </video>
      </div>

      <div v-else-if="isAudio" class="audio-preview">
        <audio controls style="width: 100%">
          <source :src="fileUrl" :type="audioType">
          您的浏览器不支持音频播放
        </audio>
      </div>

      <div v-else-if="isDocument" class="document-preview">
        <iframe
            :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`"
            width="100%"
            height="600px"
            frameborder="0"
            v-if="isOfficeDocument"
        ></iframe>
        <div v-else class="unsupported-document">
          <i class="el-icon-document"></i>
          <p>不支持在线预览，请下载查看</p>
          <el-button type="primary" @click="downloadFile">
            <i class="el-icon-download"></i> 下载文件
          </el-button>
        </div>
      </div>

      <div v-else class="other-preview">
        <i class="el-icon-files" style="font-size: 48px;"></i>
        <p>不支持预览，请下载查看</p>
        <el-button type="primary" @click="downloadFile">
          <i class="el-icon-download"></i> 下载文件
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="downloadFile">
        <i class="el-icon-download"></i> 下载
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { FileType, FilesVO } from '@/types/files'
import { getFileDownloadUrl } from '@/apis/files'

export default defineComponent({
  name: 'FilePreviewModal',
  props: {
    file: {
      type: Object as PropType<FilesVO>,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props) {
    const fileUrl = computed(() => getFileDownloadUrl(props.file.fileUrl))

    const isImage = computed(() => props.file.fileType === FileType.IMAGE)
    const isVideo = computed(() => props.file.fileType === FileType.VIDEO)
    const isAudio = computed(() => props.file.fileType === FileType.AUDIO)
    const isDocument = computed(() => props.file.fileType === FileType.DOCUMENT)

    const videoType = computed(() => {
      const ext = props.file.fileName.split('.').pop()?.toLowerCase()
      return `video/${ext}`
    })

    const audioType = computed(() => {
      const ext = props.file.fileName.split('.').pop()?.toLowerCase()
      return `audio/${ext}`
    })

    const isOfficeDocument = computed(() => {
      const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']
      const ext = props.file.fileName.split('.').pop()?.toLowerCase()
      return ext && officeExts.includes(ext)
    })

    const downloadFile = () => {
      const a = document.createElement('a')
      a.href = fileUrl.value
      a.download = props.file.fileName
      a.click()
    }

    return {
      fileUrl,
      isImage,
      isVideo,
      isAudio,
      isDocument,
      videoType,
      audioType,
      isOfficeDocument,
      downloadFile
    }
  }
})
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.unsupported-document, .other-preview {
  text-align: center;
  padding: 20px;
}

.unsupported-document p, .other-preview p {
  margin: 10px 0;
}
</style>