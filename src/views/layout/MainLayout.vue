<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <el-header class="navbar">
      <div class="navbar-left">
        <div class="logo">🎓</div>
        <div class="title">社团管理系统</div>
      </div>

      <div class="navbar-right">
        <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb">
          <el-breadcrumb-item :to="{ name: 'Home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentPageTitle !== '首页'">{{ currentPageTitle }}</el-breadcrumb-item>
        </el-breadcrumb>

        <el-dropdown @command="handleCommand">
          <div class="user-section">
            <el-avatar :size="40" :src="userInfo.avatarUrl" />
            <div class="user-info">
              <div class="user-name">{{ userInfo.nickName }}</div>
              <div class="user-role">{{ currentRoleName }}</div>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="layout-container">
      <!-- 左侧菜单栏 -->
      <el-aside class="sidebar" :class="{ 'is-collapse': isCollapse }">
        <el-menu
            :default-active="activeMenu"
            router
            :collapse="isCollapse"
            class="menu-bar"
            v-loading="menuStore.loading"
        >
          <!-- 首页菜单 -->
          <el-menu-item index="/" @click="goToHome">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <!-- 动态菜单 -->
          <template v-for="menu in visibleMenus" :key="menu.menuId">
            <!-- 有子菜单的目录 -->
            <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="`menu_${menu.menuId}`">
              <template #title>
                <el-icon>
                  <component :is="getMenuIcon(menu.icon)" />
                </el-icon>
                <span>{{ menu.menuName }}</span>
              </template>
              <el-menu-item
                  v-for="child in menu.children"
                  :key="child.menuId"
                  :index="getMenuPath(child)"
                  @click="navigateTo(child)"
              >
                <template #title>{{ child.menuName }}</template>
              </el-menu-item>
            </el-sub-menu>

            <!-- 单个菜单项 -->
            <el-menu-item v-else :index="getMenuPath(menu)" @click="navigateTo(menu)">
              <el-icon>
                <component :is="getMenuIcon(menu.icon)" />
              </el-icon>
              <template #title>{{ menu.menuName }}</template>
            </el-menu-item>
          </template>
        </el-menu>

        <!-- 折叠按钮 -->
        <div class="sidebar-footer">
          <el-button
              circle
              :icon="isCollapse ? Expand : Fold"
              @click="isCollapse = !isCollapse"
          />
        </div>
      </el-aside>

      <!-- 右侧内容区 -->
      <div class="content-wrapper">
        <div class="content-main">
          <router-view v-slot="{ Component }">
            <component :is="Component" :key="$route.fullPath" />
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import { useMenuStore } from '@/stores/menuStore'
import { useMenuPermissionStore } from '@/stores/menuPermissionStore'
import {
  HomeFilled,
  ShoppingBag,
  Management,
  Calendar,
  Files,
  Setting,
  User,
  Lock,
  List,
  Plus,
  View,
  ArrowRight,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import type { MenuItem } from '@/apis/menus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const menuPermissionStore = useMenuPermissionStore()

// 状态
const isCollapse = ref(false)
const activeMenu = ref('')

// 图标映射
const iconMap: Record<string, any> = {
  'Home': HomeFilled,
  'ShoppingBag': ShoppingBag,
  'Management': Management,
  'Calendar': Calendar,
  'Files': Files,
  'Setting': Setting,
  'User': User,
  'Lock': Lock,
  'List': List,
  'Plus': Plus,
  'View': View
}

// 计算属性
const userInfo = computed(() => authStore.userInfo)

const currentRoleName = computed(() => {
  const roleMap: Record<number, string> = {
    1: '教师',
    2: '会长',
    3: '副会长',
    4: '部长',
    5: '副部长',
    6: '工作人员',
    7: '学生',
    8: '游客'
  }
  return roleMap[authStore.userInfo.roleId] || '未知'
})

const currentPageTitle = computed(() => {
  return route.meta.title as string || '首页'
})

// 获取可见菜单
const visibleMenus = computed(() => {
  const userRole = authStore.userInfo.roleId
  
  // 学生只能看到首页，不显示其他菜单
  if (userRole === 7) {
    return []
  }
  
  // 过滤菜单
  return menuStore.menuTree.filter(menu => {
    // 过滤掉首页（单独显示）和按钮类型
    if (menu.menuName === '首页' || menu.menuType === 3 || menu.status !== 1) {
      return false
    }
    
    // 教师可以看到所有菜单
    if (userRole === 1) {
      return true
    }
    
    // 其他角色根据权限过滤
    return menuPermissionStore.checkPermission(menu.permissionCode || '')
  })
})

// 方法
const getMenuIcon = (iconName: string) => {
  return iconMap[iconName] || Files
}

const getMenuPath = (menu: MenuItem) => {
  let path = menu.path
  
  // 处理带参数的路径
  if (path.includes(':clubId')) {
    const clubId = authStore.currentClub?.clubId || authStore.userClubId || 1
    path = path.replace(':clubId', clubId.toString())
  }
  
  // 确保路径以 / 开头
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  
  return path
}

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/user/profile')
  } else if (command === 'logout') {
    authStore.clearAuth()
    menuStore.clearMenus()
    menuPermissionStore.clearMenus()
    router.replace('/login')
    ElMessage.success('已登出')
  }
}

const goToHome = () => {
  router.push({ name: 'Home' })
}

const navigateTo = (menu: MenuItem) => {
  let path = menu.path
  
  // 处理带参数的路径
  if (path.includes(':clubId')) {
    // 对于教师，如果路径需要clubId但没有选择社团，跳转到社团管理页面
    if (authStore.isTeacher && !authStore.currentClub) {
      // 教师访问需要clubId的页面时，直接跳转到社团管理让其选择
      router.push('/admin/club')
      return
    }
    
    // 使用当前用户的clubId或当前管理的社团ID
    const clubId = authStore.currentClub?.clubId || authStore.userClubId || 1
    path = path.replace(':clubId', clubId.toString())
  }
  
  // 确保路径以 / 开头
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  
  router.push(path)
}

// 监听路由变化更新活动菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

onMounted(() => {
  activeMenu.value = route.path
})
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo {
        font-size: 28px;
        font-weight: bold;
      }

      .title {
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 1px;
      }
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 30px;

      .breadcrumb {
        color: rgba(255, 255, 255, 0.9);
        
        :deep(.el-breadcrumb__item) {
          .el-breadcrumb__inner {
            color: rgba(255, 255, 255, 0.9);
            
            &:hover {
              color: white;
            }
          }
        }
      }

      .user-section {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 6px;
        transition: background 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          justify-content: center;

          .user-name {
            font-size: 14px;
            font-weight: 500;
          }

          .user-role {
            font-size: 12px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .layout-container {
    display: flex;
    flex: 1;
    overflow: hidden;

    .sidebar {
      width: 200px;
      background: white;
      border-right: 1px solid #e0e6ed;
      overflow-y: auto;
      transition: width 0.3s;
      display: flex;
      flex-direction: column;

      &.is-collapse {
        width: 64px;
      }

      .menu-bar {
        border: none;
        flex: 1;
      }

      .sidebar-footer {
        padding: 12px;
        border-top: 1px solid #e0e6ed;
        text-align: center;

        button {
          width: 40px;
          height: 40px;
        }
      }
    }

    .content-wrapper {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .content-main {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .navbar-right {
    gap: 15px !important;
  }

  .sidebar {
    width: 180px !important;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 10px !important;

    .navbar-left {
      .title {
        display: none;
      }
    }

    .navbar-right {
      flex-direction: column;
      gap: 10px !important;

      .breadcrumb {
        display: none;
      }
    }
  }
}
</style>