<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="card-panel">
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-title">社团总数</div>
        <div class="stat-value">{{ dashboardStats.totalClubs }}</div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-title">注册成员</div>
        <div class="stat-value">{{ dashboardStats.totalMembers }}</div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-title">本月活动</div>
        <div class="stat-value">{{ dashboardStats.monthlyActivities }}</div>
      </el-card>
      <el-card class="stat-card" shadow="hover" v-loading="statsLoading">
        <div class="stat-title">待审批</div>
        <div class="stat-value">{{ dashboardStats.pendingApprovals }}</div>
      </el-card>
    </div>

    <!-- 图表部分 -->
    <div class="chart-panel">
      <el-card class="chart-box" shadow="never" v-loading="chartLoading">
        <template #header>社团活动发布趋势</template>
        <v-chart :option="activityTrendOption" autoresize style="height: 300px;" />
      </el-card>
      <el-card class="chart-box" shadow="never" v-loading="chartLoading">
        <template #header>成员专业分布</template>
        <v-chart :option="majorPieOption" autoresize style="height: 300px;" />
      </el-card>
    </div>

    <!-- 公告 & 快捷入口 -->
    <div class="bottom-panel">
      <el-card class="announcement-card" shadow="never">
        <template #header>系统公告</template>
        <ul>
          <li>2025-01-03：系统更新，优化权限管理功能。</li>
          <li>2024-12-28：新增活动审批模块。</li>
          <li>2024-12-15：修复若干小问题。</li>
        </ul>
      </el-card>

      <el-card class="quick-card" shadow="never">
        <template #header>快捷操作</template>
        <div class="quick-actions">
          <el-button 
            v-if="canCreateClub" 
            type="primary" 
            plain 
            @click="goToCreateClub"
          >
            创建社团
          </el-button>
          <el-button 
            v-if="canManageActivities" 
            type="success" 
            plain 
            @click="goToActivities"
          >
            发布活动
          </el-button>
          <el-button 
            v-if="canManageMembers" 
            type="warning" 
            plain 
            @click="goToMembers"
          >
            管理成员
          </el-button>
          <el-button 
            v-if="canAccessAdmin" 
            type="info" 
            plain 
            @click="goToAdmin"
          >
            后台管理
          </el-button>
          <el-button 
            type="warning" 
            plain 
            @click="showMenuData"
          >
            查看菜单数据
          </el-button>
          <el-button 
            type="danger" 
            plain 
            @click="goToRefreshTest"
          >
            刷新测试
          </el-button>
          <el-button 
            type="info" 
            plain 
            @click="goToRouteDebug"
          >
            路由调试
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import { useMenuStore } from '@/stores/menuStore'
import { useMenuPermissionStore } from '@/stores/menuPermissionStore'
import { 
  getDashboardStatsService, 
  getActivityTrendService, 
  getMajorDistributionService,
  getUserClubStatsService,
  type DashboardStats 
} from '@/apis/statistics'

const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const menuPermissionStore = useMenuPermissionStore()

// 状态
const statsLoading = ref(false)
const chartLoading = ref(false)
const dashboardStats = ref<DashboardStats>({
  totalClubs: 0,
  totalMembers: 0,
  monthlyActivities: 0,
  pendingApprovals: 0
})

const activityTrendOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '活动数量',
      type: 'line',
      data: [],
      smooth: true,
      itemStyle: {
        color: '#409eff'
      }
    }
  ]
})

const majorPieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { top: 'bottom' },
  series: [
    {
      name: '专业分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      data: []
    }
  ]
})

// 计算属性 - 权限控制
const canCreateClub = computed(() => authStore.isTeacher)
const canManageActivities = computed(() => authStore.canAccessAdmin)
const canManageMembers = computed(() => {
  const roleId = authStore.userInfo.roleId
  return roleId && roleId <= 3 // 教师、会长、副会长
})
const canAccessAdmin = computed(() => authStore.canAccessAdmin)

// 方法
const loadDashboardStats = async () => {
  try {
    statsLoading.value = true
    
    // 根据用户角色加载不同的统计数据
    let response
    if (authStore.isTeacher) {
      // 教师看全局统计
      response = await getDashboardStatsService()
    } else if (authStore.canAccessAdmin) {
      // 其他管理角色看自己社团的统计
      response = await getUserClubStatsService()
    } else {
      // 学生看全局统计（只读）
      response = await getDashboardStatsService()
    }
    
    if (response.code === 200 || response.code === 0) {
      dashboardStats.value = response.data
    } else {
      console.warn('获取统计数据失败:', response.message)
      ElMessage.warning('获取统计数据失败')
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    statsLoading.value = false
  }
}

const loadChartData = async () => {
  try {
    chartLoading.value = true
    
    // 加载活动趋势数据
    try {
      const trendResponse = await getActivityTrendService()
      if (trendResponse.code === 200 || trendResponse.code === 0) {
        const trendData = trendResponse.data
        activityTrendOption.value.xAxis.data = trendData.map(item => item.month)
        activityTrendOption.value.series[0].data = trendData.map(item => item.count)
      } else {
        console.warn('获取活动趋势数据失败，使用模拟数据:', trendResponse.message)
        // 使用模拟数据
        activityTrendOption.value.xAxis.data = ['9月', '10月', '11月', '12月', '1月']
        activityTrendOption.value.series[0].data = [2, 4, 3, 5, 6]
      }
    } catch (error) {
      console.warn('活动趋势API调用失败，使用模拟数据:', error)
      activityTrendOption.value.xAxis.data = ['9月', '10月', '11月', '12月', '1月']
      activityTrendOption.value.series[0].data = [2, 4, 3, 5, 6]
    }
    
    // 加载专业分布数据 - 真正从数据库查询
    try {
      const majorResponse = await getMajorDistributionService()
      if (majorResponse.code === 200 || majorResponse.code === 0) {
        const majorData = majorResponse.data
        if (majorData && majorData.length > 0) {
          // 有真实数据，使用真实数据
          majorPieOption.value.series[0].data = majorData.map(item => ({
            name: item.major,
            value: item.count
          }))
          console.log('使用真实专业分布数据:', majorData)
        } else {
          // 没有数据，显示空状态
          majorPieOption.value.series[0].data = [
            { name: '暂无数据', value: 1 }
          ]
          console.log('当前系统中没有用户专业数据')
        }
      } else {
        console.warn('获取专业分布数据失败:', majorResponse.message)
        // API调用失败，显示错误状态
        majorPieOption.value.series[0].data = [
          { name: '数据加载失败', value: 1 }
        ]
      }
    } catch (error) {
      console.warn('专业分布API调用失败:', error)
      // 网络错误或其他异常，显示错误状态
      majorPieOption.value.series[0].data = [
        { name: '网络错误', value: 1 }
      ]
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
    ElMessage.error('加载图表数据失败')
    
    // 全部失败时的处理
    activityTrendOption.value.xAxis.data = ['9月', '10月', '11月', '12月', '1月']
    activityTrendOption.value.series[0].data = [2, 4, 3, 5, 6]
    
    majorPieOption.value.series[0].data = [
      { name: '系统错误', value: 1 }
    ]
  } finally {
    chartLoading.value = false
  }
}

// 快捷操作
const goToCreateClub = () => {
  router.push('/admin/club')
}

const goToActivities = () => {
  if (authStore.isTeacher) {
    router.push('/admin/club')
  } else {
    const clubId = authStore.userClubId
    if (clubId) {
      router.push(`/admin/club/${clubId}/activities`)
    } else {
      ElMessage.warning('未找到您所属的社团')
    }
  }
}

const goToMembers = () => {
  if (authStore.isTeacher) {
    router.push('/admin/club')
  } else {
    const clubId = authStore.userClubId
    if (clubId) {
      router.push(`/admin/club/${clubId}/members`)
    } else {
      ElMessage.warning('未找到您所属的社团')
    }
  }
}

const goToAdmin = () => {
  router.push('/admin')
}

const goToRefreshTest = () => {
  router.push('/test-refresh')
}

const goToRouteDebug = () => {
  router.push('/debug')
}

const showMenuData = async () => {
  try {
    // 使用模拟菜单数据进行测试
    const mockMenuData = [
      {
        menuId: 1,
        parentId: 0,
        menuName: '首页',
        path: 'home',
        component: 'common/Home',
        permissionCode: 'common:viewHome',
        icon: 'Home',
        sortOrder: 1,
        menuType: 2,
        status: 1,
        children: []
      },
      {
        menuId: 2,
        parentId: 0,
        menuName: '后台管理',
        path: 'admin',
        component: 'layout/BlankLayout',
        permissionCode: 'admin:access',
        icon: 'Setting',
        sortOrder: 2,
        menuType: 1,
        status: 1,
        children: [
          {
            menuId: 3,
            parentId: 2,
            menuName: '社团管理',
            path: 'admin/club',
            component: 'admin/club/ClubManage',
            permissionCode: 'admin:manageAllClubs',
            icon: 'ShoppingBag',
            sortOrder: 1,
            menuType: 2,
            status: 1,
            children: []
          },
          {
            menuId: 4,
            parentId: 2,
            menuName: '我的社团',
            path: 'admin/club/1/dashboard',
            component: 'admin/club/ClubDashboard',
            permissionCode: 'club:manage',
            icon: 'Management',
            sortOrder: 2,
            menuType: 2,
            status: 1,
            children: [
              {
                menuId: 5,
                parentId: 4,
                menuName: '部门管理',
                path: 'admin/club/1/departments',
                component: 'admin/club/departments/DepartmentManage',
                permissionCode: 'dept:manageDepartment',
                icon: 'Management',
                sortOrder: 1,
                menuType: 2,
                status: 1,
                children: []
              },
              {
                menuId: 6,
                parentId: 4,
                menuName: '活动管理',
                path: 'admin/club/1/activities',
                component: 'admin/club/activities/ActivityManage',
                permissionCode: 'activity:manage',
                icon: 'Calendar',
                sortOrder: 2,
                menuType: 2,
                status: 1,
                children: []
              }
            ]
          }
        ]
      }
    ]
    
    // 尝试真实API，如果失败则使用模拟数据
    let menuData
    try {
      if (!menuStore.initialized) {
        await menuStore.fetchUserMenus()
        await menuPermissionStore.loadMenusAndPermissions()
      }
      menuData = {
        source: 'real_api',
        userInfo: authStore.userInfo,
        menuTree: menuStore.menuTree,
        permissions: menuPermissionStore.permissions,
        allRoutes: router.getRoutes().map(r => ({ name: r.name, path: r.path }))
      }
    } catch (error) {
      console.error('真实API调用失败，使用模拟数据:', error)
      menuData = {
        source: 'mock_data',
        userInfo: authStore.userInfo,
        menuTree: mockMenuData,
        permissions: ['admin:access', 'club:manage', 'dept:manageDepartment', 'activity:manage'],
        allRoutes: router.getRoutes().map(r => ({ name: r.name, path: r.path })),
        error: error.message
      }
    }
    
    ElMessageBox.alert(
      `<pre style="text-align: left; max-height: 400px; overflow: auto;">${JSON.stringify(menuData, null, 2)}</pre>`,
      '菜单数据调试',
      {
        dangerouslyUseHTMLString: true,
        customStyle: { width: '80%' }
      }
    )
  } catch (error) {
    console.error('获取菜单数据失败:', error)
    ElMessage.error('获取菜单数据失败')
  }
}

onMounted(() => {
  loadDashboardStats()
  loadChartData()
})
</script>

<style scoped>


.dashboard-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-panel {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: -25px; /* 原来可能是 24px 或更大，适当调小 */
  gap: 16px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  text-align: center;
}

.stat-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}


.chart-panel {
  display: flex;
  gap: 20px;
}

.chart-box {
  flex: 1;
}

.bottom-panel {
  display: flex;
  gap: 20px;
}

.announcement-card,
.quick-card {
  flex: 1;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-actions .el-button {
  width: 100%;
}
</style>
