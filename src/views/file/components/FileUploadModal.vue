<template>
  <el-dialog
      title="上传文件"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
  >
    <el-form label-width="80px">
      <el-form-item label="文件类型" required>
        <el-select v-model="form.fileType" placeholder="请选择文件类型">
          <el-option
              v-for="type in fileTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="选择文件" required>
        <el-upload
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            :limit="1"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip">
            已选择: {{ form.file?.name || '未选择文件' }}
          </div>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="uploading">
        确定上传
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FileType } from '@/types/files'
import { uploadFileService } from '@/apis/files'

const props = defineProps({
  clubId: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success', 'update:modelValue'])

// 控制对话框显示状态（内部变量）
const dialogVisible = ref(false)

// 同步 modelValue 到内部变量
watch(
    () => props.modelValue,
    (newVal) => {
      dialogVisible.value = newVal
    }
)

// 当对话框关闭时更新父组件的 modelValue
watch(
    dialogVisible,
    (newVal) => {
      if (!newVal) {
        emit('update:modelValue', false)
      }
    }
)

// 表单数据
const form = ref({
  fileType: FileType.IMAGE,
  file: null as File | null
})

const uploading = ref(false)

const fileTypes = [
  { value: FileType.IMAGE, label: '图片' },
  { value: FileType.VIDEO, label: '视频' },
  { value: FileType.AUDIO, label: '音频' },
  { value: FileType.DOCUMENT, label: '文档' },
  { value: FileType.OTHER, label: '其他' }
]

// 文件选择变化
const handleFileChange = (file: any) => {
  form.value.file = file.raw || file
}

// 提交上传
const handleSubmit = async () => {
  if (!form.value.file) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  try {
    uploading.value = true

    // 调用上传接口
    const res = await uploadFileService({
      clubId: props.clubId,
      fileType: form.value.fileType,
      file: form.value.file
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('上传成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

// 关闭模态框
const handleClose = () => {
  dialogVisible.value = false
}
</script>