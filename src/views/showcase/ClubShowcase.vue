<template>
  <div class="club-showcase">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span class="title">社团展示</span>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索社团..."
              style="width: 300px"
              clearable
              @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </template>
    </el-card>

    <!-- 社团卡片网格 -->
    <div class="clubs-grid" v-loading="loading">
      <div
          v-for="club in clubs"
          :key="club.clubId"
          class="club-card"
          @click="goToClubDetail(club.clubId)"
      >
        <div class="club-logo">
          <el-image
              v-if="club.logoUrl"
              :src="club.logoUrl"
              fit="cover"
              class="logo-img"
          />
          <div v-else class="logo-placeholder">
            <el-icon :size="40"><ShoppingBag /></el-icon>
          </div>
        </div>

        <div class="club-content">
          <h3 class="club-name">{{ club.clubName }}</h3>
          <p class="club-description">{{ club.description || '暂无描述' }}</p>
          <div class="club-meta">
            <span class="club-founder">
              <el-icon><User /></el-icon>
              {{ club.founderUserName }}
            </span>
          </div>
        </div>

        <div class="club-action">
          <el-button type="primary" round size="small">查看详情</el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && clubs.length === 0" description="暂无社团" />

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, sizes"
          :page-sizes="[6, 12, 24, 48]"
          @current-change="fetchClubs"
          @size-change="fetchClubs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClubListService } from '@/apis/club'
import { Search, ShoppingBag, User } from '@element-plus/icons-vue'
import type { ClubVO } from '@/types/club'

const router = useRouter()

const clubs = ref<ClubVO[]>([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)
const searchKeyword = ref('')

const fetchClubs = async () => {
  try {
    loading.value = true
    const res = await getClubListService({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value.trim()
    })

    if (res.data.code === 0 || res.data.code === 200) {
      clubs.value = res.data.data.records
      total.value = res.data.data.total || 0;
    } else {
      ElMessage.error(res.data.message || '获取社团列表失败')
    }
  } catch (error) {
    ElMessage.error('获取社团列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchClubs()
}

const goToClubDetail = (clubId: number) => {
  router.push({ name: 'ClubInfo', params: { clubId } })
}

onMounted(fetchClubs)
</script>

<style scoped lang="scss">
.club-showcase {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .header-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }
    }
  }

  .clubs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    min-height: 400px;

    .club-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

        .club-action {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .club-logo {
        width: 100%;
        height: 180px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .logo-img {
          width: 100%;
          height: 100%;
        }

        .logo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      }

      .club-content {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .club-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .club-description {
          margin: 0;
          font-size: 13px;
          color: #999;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .club-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #666;

          .club-founder {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .club-action {
        padding: 0 16px 12px;
        opacity: 0;
        transform: translateY(4px);
        transition: all 0.3s;

        button {
          width: 100%;
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
  }
}

@media (max-width: 1200px) {
  .clubs-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
  }
}

@media (max-width: 768px) {
  .clubs-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
    gap: 12px !important;
  }

  .header-card .card-header {
    flex-direction: column;
    gap: 12px !important;

    input {
      width: 100% !important;
    }
  }
}
</style>