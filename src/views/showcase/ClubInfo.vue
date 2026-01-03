<template>
  <div class="club-info-page" v-loading="loading">
    <el-card v-if="club" class="club-header">
      <div class="club-header-content">
        <div class="club-logo-large">
          <el-image
              v-if="club.logoUrl"
              :src="club.logoUrl"
              fit="cover"
          />
          <div v-else class="logo-placeholder">
            <el-icon :size="80"><ShoppingBag /></el-icon>
          </div>
        </div>

        <div class="club-info-box">
          <h1 class="club-title">{{ club.clubName }}</h1>
          <div class="club-meta-info">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              会长: {{ club.founderUserName }}
            </span>
          </div>
          <p class="club-desc">{{ club.description }}</p>

          <div class="action-buttons">
            <el-button type="primary" size="large" @click="handleAction('join')">
              加入社团
            </el-button>
            <el-button size="large" @click="handleAction('contact')">
              联系社团
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 社团内容 Tabs -->
    <el-tabs v-model="activeTab" class="content-tabs">
      <el-tab-pane label="部门与成员" name="members">
        <DepartmentMemberSection :club-id="clubId" />
      </el-tab-pane>

      <el-tab-pane label="社团活动" name="activities">
        <ActivitySection :club-id="clubId" />
      </el-tab-pane>

      <el-tab-pane label="社团文件" name="files">
        <FileSection :club-id="clubId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClubByIdService } from '@/apis/club'
import { ShoppingBag, User } from '@element-plus/icons-vue'
import type { ClubVO } from '@/types/club'
import DepartmentMemberSection from './components/DepartmentMemberSection.vue'
import ActivitySection from './components/ActivitySection.vue'
import FileSection from './components/FileSection.vue'

const route = useRoute()
const clubId = Number(route.params.clubId)

const club = ref<ClubVO | null>(null)
const loading = ref(false)
const activeTab = ref('members')

const fetchClubInfo = async () => {
  try {
    loading.value = true
    const res = await getClubByIdService(clubId)

    if (res.data?.code === 0 || res.data?.code === 200) {
      club.value = res.data.data
    } else {
      ElMessage.error(res.data?.message || '获取社团信息失败')
    }
  } catch (error) {
    ElMessage.error('获取社团信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAction = (action: string) => {
  if (action === 'join') {
    ElMessage.info('加入功能开发中...')
  } else if (action === 'contact') {
    ElMessage.info('联系功能开发中...')
  }
}

onMounted(fetchClubInfo)
</script>

<style scoped lang="scss">
.club-info-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .club-header {
    .club-header-content {
      display: flex;
      gap: 40px;
      align-items: flex-start;

      .club-logo-large {
        flex-shrink: 0;
        width: 240px;
        height: 240px;
        border-radius: 12px;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;

        .logo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .club-info-box {
        flex: 1;
        padding: 20px 0;

        .club-title {
          margin: 0 0 16px;
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }

        .club-meta-info {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #666;
          }
        }

        .club-desc {
          margin: 16px 0;
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          max-width: 600px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;

          button {
            min-width: 120px;
          }
        }
      }
    }
  }

  .content-tabs {
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }
}

@media (max-width: 768px) {
  .club-header-content {
    flex-direction: column !important;
    align-items: center !important;

    .club-logo-large {
      width: 160px !important;
      height: 160px !important;
    }

    .club-info-box {
      width: 100%;

      .club-title {
        font-size: 24px !important;
      }
    }
  }
}
</style>