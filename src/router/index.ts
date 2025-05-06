import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// 公共页面
const Layout = () => import('@/views/common/Layout.vue')
const Login = () => import('@/views/common/Login.vue')
const NotFound = () => import('@/views/common/NotFound.vue')
const Register = () => import('@/views/common/Register.vue')
const Home = () => import('@/views/common/Home.vue')

// 管理页面
const Role = () => import('@/views/management/role.vue')
const Permissions = () => import('@/views/management/permission.vue')

// 用户信息页面
const UserInfo = () => import('@/views/user/UserInfo.vue')
const UpdatePassword = () => import('@/views/user/UpdatePassword.vue')

const routes: Array<RouteRecordRaw> = [
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
        component: Layout,
        meta: {
            requiresAuth: true,
            title: '首页'
        },
        children: [
            {
                path: '',
                name: 'Home',
                component: Home,
                meta: { title: '首页' }
            },
            {
                path: '/management/permission',
                name: 'Permission',
                component: Permissions,
                meta: {
                    title: '权限管理'
                }
            },
            {
                path: '/management/role',
                name: 'RoleManagement',
                component: Role,
                meta: {
                    title: '角色管理'
                }
            },
            {
                path: '/user/info',
                name: 'UserInfo',
                component: UserInfo,
                meta: {
                    title: '个人信息'
                }
            },
            {
                path: '/user/updatePassword',
                name: 'UpdatePassword',
                component: UpdatePassword,
                meta: {
                    title: '修改密码'
                }
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
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth) {
        if (authStore.token) {
            next()
        } else {
            next({
                name: 'Login',
                query: { redirect: to.fullPath }
            })
        }
    } else if (['Login', 'Register'].includes(to.name as string) && authStore.token) {
        next({ name: 'Home' })
    } else {
        next()
    }
})

export default router
