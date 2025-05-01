import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const Layout = () => import('@/views/common/Layout.vue')
const Login = () => import('@/views/common/Login.vue')
const NotFound = () => import('@/views/common/NotFound.vue')
const Register = () => import('@/views/common/Register.vue')
const Home = () => import('@/views/common/Home.vue')
const Role = () => import('@/views/management/role.vue')
const Permissions = () => import('@/views/management/permission.vue')

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/',
        component: Layout,
        meta: {
            requiresAuth: true,
            title: '首页'
        },
        children: [
            { path: '/', name: 'Home', component: Home, meta: { title: '首页' } },

            { path: '/management/permission',
                name: 'Permission',
                component: Permissions,
                meta: {
                    title: '权限管理',
                } },
            {
                path: '/management/role',
                name: 'RoleManagement',
                component: Role,
                meta: {
                    title: '角色管理',
                }
            }
        ]
    },
    {
        path: '/:catchAll(.*)',
        component: NotFound
    },
    {
        path: '/Register',
        name: 'Register',
        component: Register
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 新增路由守卫
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 需要登录的页面验证
    if (to.meta.requiresAuth) {
        if (authStore.token) {
            next()
        } else {
            next({
                name: 'Login',
                query: { redirect: to.fullPath }
            })
        }
    }
    // 已登录用户禁止访问登录/注册页
    else if (['Login', 'Register'].includes(to.name as string) && authStore.token) {
        next({ name: 'Home' })
    }
    // 其他情况直接放行
    else {
        next()
    }
})

export default router