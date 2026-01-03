import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import { useMenuStore } from '@/stores/menuStore'
import { useMenuPermissionStore } from '@/stores/menuPermissionStore'
import { convertMenusToRoutes, addRoutesToRouter } from './dynamicRoutes'
import { RefreshHandler } from '@/utils/refreshHandler'

// 公共页面
const Layout = () => import('@/views/common/Layout.vue')
const Login = () => import('@/views/common/Login.vue')
const NotFound = () => import('@/views/common/NotFound.vue')
const Register = () => import('@/views/common/Register.vue')
const Home = () => import('@/views/common/Home.vue')
const Profile = () => import('@/views/user/Profile.vue')
const RouteDebug = () => import('@/views/debug/RouteDebug.vue')

// 静态路由（无需权限）
const constantRoutes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/',
        name: 'Layout',
        component: Layout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Home',
                component: Home,
                meta: { title: '首页' }
            },
            {
                path: 'user/profile',
                name: 'Profile',
                component: Profile,
                meta: { title: '个人中心' }
            },
            {
                path: 'debug',
                name: 'RouteDebug',
                component: RouteDebug,
                meta: { title: '路由调试' }
            },
            {
                path: 'test-menu',
                name: 'TestMenu',
                component: () => import('@/views/debug/MenuTest.vue'),
                meta: { title: '菜单测试' }
            },
            {
                path: 'test-refresh',
                name: 'RefreshTest',
                component: () => import('@/views/debug/RefreshTest.vue'),
                meta: { title: '刷新测试' }
            },
            {
                path: 'teacher-debug',
                name: 'TeacherRouteDebug',
                component: () => import('@/views/debug/TeacherRouteDebug.vue'),
                meta: { title: '教师路由调试' }
            },
            // 临时测试路由
            {
                path: 'admin/club/:clubId/dashboard',
                name: 'TempClubDashboard',
                component: () => import('@/views/admin/club/ClubDashboard.vue'),
                meta: { title: '临时社团管理' }
            },
            // 部门详情页面
            {
                path: 'admin/club/:clubId/department/:departmentId/dashboard',
                name: 'DepartmentDetail',
                component: () => import('@/views/admin/club/departments/DepartmentDetail.vue'),
                meta: { title: '部门详情', requiresAuth: true }
            },
            // 活动详情页面
            {
                path: 'admin/club/:clubId/activity/:activityId/detail',
                name: 'ActivityDetail',
                component: () => import('@/views/admin/club/activities/ActivityDetail.vue'),
                meta: { title: '活动详情', requiresAuth: true }
            },
            // 活动编辑页面
            {
                path: 'admin/club/:clubId/activity/:activityId/edit',
                name: 'ActivityEdit',
                component: () => import('@/views/admin/club/activities/ActivityEdit.vue'),
                meta: { title: '编辑活动', requiresAuth: true, permission: 'activity:manage' }
            }
        ]
    },
    {
        path: '/:catchAll(.*)',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes
})

// 动态路由添加标记
let dynamicRoutesAdded = false

// 路由守卫
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const menuStore = useMenuStore()
    const menuPermissionStore = useMenuPermissionStore()

    console.log('路由守卫:', to.path, '用户角色:', authStore.userInfo.roleId)

    // 检查是否为页面刷新
    const isPageRefresh = RefreshHandler.isPageRefresh() || (!from.name && to.path !== '/login' && to.path !== '/register')
    
    // 如果是页面刷新且应该重定向到首页
    if (isPageRefresh && RefreshHandler.shouldRedirectToHome(to.path, !!authStore.token)) {
        console.log('检测到页面刷新，重定向到首页')
        RefreshHandler.forceRedirectToHome()
        return
    }

    // 需要登录的页面
    if (to.meta.requiresAuth) {
        if (!authStore.token) {
            next({ name: 'Login', query: { redirect: to.fullPath } })
            return
        }

        // 检查学生角色是否试图访问后台管理
        if (to.path.startsWith('/admin') && !authStore.canAccessAdmin) {
            console.log('学生角色无法访问后台管理')
            next({ name: 'Home' })
            return
        }

        // 加载菜单和权限（首次进入）
        if (!menuStore.initialized) {
            console.log('首次加载菜单数据...')
            try {
                await menuStore.fetchUserMenus()
                await menuPermissionStore.loadMenusAndPermissions()
                console.log('菜单数据加载完成:', menuStore.menuTree)
            } catch (error) {
                console.error('加载菜单失败:', error)
                ElMessage.error('加载菜单失败')
                next({ name: 'Home' })
                return
            }
        }

        // 添加动态路由（首次进入）
        if (!dynamicRoutesAdded && menuStore.menuTree.length > 0) {
            try {
                console.log('开始添加动态路由...')
                const dynamicRoutes = convertMenusToRoutes(menuStore.menuTree)
                console.log('生成的动态路由数量:', dynamicRoutes.length)
                
                // 使用安全的路由添加方法
                const { addedRoutes, failedRoutes } = addRoutesToRouter(router, dynamicRoutes)
                
                dynamicRoutesAdded = true
                console.log('动态路由添加完成')
                
                // 打印所有路由用于调试
                console.log('当前所有路由:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
                
                // 如果有失败的路由，显示警告
                if (failedRoutes.length > 0) {
                    console.warn('部分路由添加失败:', failedRoutes)
                    ElMessage.warning(`部分路由加载失败，可能影响某些功能`)
                }
                
                // 如果当前路由是动态路由，重新导航
                if (to.path !== '/' && 
                    to.name !== 'Home' && 
                    to.name !== 'Profile' && 
                    to.name !== 'RouteDebug' && 
                    to.name !== 'TestMenu' &&
                    to.name !== 'RefreshTest' &&
                    to.name !== 'Login' &&
                    to.name !== 'Register') {
                    console.log('重新导航到:', to.path)
                    // 使用 nextTick 确保路由已经添加完成
                    setTimeout(() => {
                        next({ ...to, replace: true })
                    }, 0)
                    return
                }
            } catch (error) {
                console.error('添加动态路由失败:', error)
                ElMessage.error('路由加载失败，请刷新页面重试')
            }
        }

        // 权限检查
        if (to.meta.permission && !menuPermissionStore.checkPermission(to.meta.permission as string)) {
            console.log('权限检查失败:', to.meta.permission)
            next({ name: 'Home' })
            return
        }

        // 对于非教师角色访问 /admin 路径的处理
        if (to.path === '/admin') {
            const roleId = authStore.userInfo.roleId
            const clubId = authStore.userClubId
            
            console.log('处理admin路径跳转, 角色:', roleId, '社团ID:', clubId)
            
            if (roleId === 1) {
                // 教师：跳转到社团管理页面（管理所有社团）
                next('/admin/club')
                return
            } else if (roleId >= 2 && roleId <= 3 && clubId) {
                // 会长、副会长：跳转到自己社团的管理页面
                next(`/admin/club/${clubId}/dashboard`)
                return
            } else if (roleId >= 4 && roleId <= 5 && clubId) {
                // 部长、副部长：跳转到自己社团的部门管理页面
                next(`/admin/club/${clubId}/departments`)
                return
            } else if (roleId === 6 && clubId) {
                // 工作人员：跳转到自己社团的活动管理页面
                next(`/admin/club/${clubId}/activities`)
                return
            } else {
                // 其他情况跳转到首页
                next({ name: 'Home' })
                return
            }
        }

        next()
    }
    // 登录页/注册页，已登录则跳转首页
    else if (['Login', 'Register'].includes(to.name as string) && authStore.token) {
        next({ name: 'Home' })
    }
    else {
        next()
    }
})

export default router