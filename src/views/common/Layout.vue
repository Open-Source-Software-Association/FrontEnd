<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  User,
  Menu as IconMenu,
  Close,
} from '@element-plus/icons-vue'
import { useAuthStore } from "@/stores/authStore"
import { TagItem } from "@/types/system";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const tags = ref<TagItem[]>([])
const activeTag = ref('')

// 初始化标签页
function initTags() {
  if (tags.value.length === 0) {
    tags.value.push({
      title: '首页',
      path: '/',
      closable: false
    })
    activeTag.value = '/'
  }
}

// 添加标签页
function addTag(tag: TagItem) {
  const exists = tags.value.some(item => item.path === tag.path)
  if (!exists) {
    tags.value.push(tag)
  }
  activeTag.value = tag.path
}

// 移除标签页
function removeTag(path: string) {
  const index = tags.value.findIndex(item => item.path === path)
  tags.value.splice(index, 1)

  if (path === activeTag.value) {
    const lastTag = tags.value[tags.value.length - 1]
    router.push(lastTag.path)
  }
}

// 路由变化监听
watch(() => route.path, (newPath) => {
  initTags()
  addTag({
    title: route.meta.title as string || '新标签',
    path: newPath,
    closable: newPath !== '/'
  })
}, { immediate: true })

// 用户操作处理
const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/user/info')
  } else if (command === 'logout') {
    authStore.clearAuth()
    router.replace('/login')
  }
}

// 动态菜单配置
const menuItems = computed(() => {
  const baseItems = [
    { index: '/', title: '首页', icon: IconMenu },
    {
      index: '/management/role',
      title: '角色管理',
      icon: IconMenu,
      requiredRole: 1
    },
    {
      index: '/management/permission',
      title: '权限管理',
      icon: IconMenu,
      requiredRole: 1
    },
    {
      index: '/club/list',
      title: '社团管理',
      icon: IconMenu,
      requiredRole: 1
    }
  ]

  return baseItems.filter(item => {
    if (!('requiredRole' in item)) return true
    return authStore.userInfo?.roleId === item.requiredRole
  })
})
</script>

<template>
  <!-- 顶部导航栏 -->
  <div class="navbar-container">
    <div class="system-title">签到管理系统</div>

    <div class="user-info-section">
      <span class="user-jobNumber">{{ authStore.userInfo.jobNumber }}</span>
      <span class="user-name">{{ authStore.userInfo.nickName }}</span>
      <el-dropdown @command="handleCommand">
        <el-avatar :icon="User" class="user-avatar" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <!-- 主体布局 -->
  <div class="main-container">
    <!-- 左侧边栏 -->
    <el-aside class="aside-menu">
      <el-menu
          :default-active="activeTag"
          active-text-color="#409eff"
          router
      >
        <el-menu-item
            v-for="item in menuItems"
            :key="item.index"
            :index="item.index"
            @click="addTag({
              title: item.title,
              path: item.index,
              closable: item.index !== '/'
            })"
        >
          <el-icon class="menu-icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <div class="content-wrapper">
      <!-- 标签导航 -->
      <div class="tabs-header scroll-container">
        <div class="tabs-container">
          <div
              v-for="tag in tags"
              :key="tag.path"
              class="tag-item"
              :class="{ 'active-tag': activeTag === tag.path }"
              @click="router.push(tag.path)"
          >
            {{ tag.title }}
            <el-icon
                v-if="tag.closable"
                class="close-icon"
                @click.stop="removeTag(tag.path)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="content-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 顶部导航栏 */
.navbar-container {
  height: 64px;
  background: #1f2937;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.system-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  max-width: 60vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 用户信息 */
.user-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-name {
  color: #fff;
  font-size: 14px;
}

.user-jobNumber {
  color: #fff;
  font-size: 14px;
}

/* 主体布局 */
.main-container {
  height: calc(100vh - 64px);
  display: flex;
}

/* 左侧菜单 */
.aside-menu {
  width: 200px;
  background: #f1f3f6;
}

.menu-icon {
  margin-right: 8px;
}

/* 标签页 */
.tabs-header {
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  padding: 0 16px;
  overflow-x: auto;
}

.tabs-container {
  display: flex;
  height: 100%;
  align-items: center;
  min-width: max-content;
}

.tag-item {
  height: 32px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.active-tag {
  background: #f0f7ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.close-icon {
  margin-left: 6px;
  font-size: 12px;
  color: #909399;
}
.close-icon:hover {
  color: #f56c6c;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  overflow: hidden;
}

.content-main {
  height: calc(100vh - 112px);
  padding: 16px;
  background: #f5f7f9;
  overflow: auto;
}

/* 用户头像 */
.user-avatar {
  background: #e5e7eb;
  cursor: pointer;
  transition: opacity 0.3s;
}
.user-avatar:hover {
  opacity: 0.8;
}

/* 隐藏滚动条 */
.scroll-container {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scroll-container::-webkit-scrollbar {
  display: none;
}
</style>