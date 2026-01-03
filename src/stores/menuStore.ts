import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserMenuTreeService, type MenuItem } from '@/apis/menus'

export const useMenuStore = defineStore('menu', () => {
    // 菜单树数据
    const menuTree = ref<MenuItem[]>([])

    // 加载状态
    const loading = ref(false)

    // 是否已初始化
    const initialized = ref(false)

    /**
     * 从后端获取用户菜单
     */
    const fetchUserMenus = async () => {
        if (initialized.value) return // 避免重复请求

        loading.value = true
        try {
            const res = await getUserMenuTreeService()
            if (res.code === 200 || res.code === 0) {
                menuTree.value = res.data || []
                initialized.value = true
            } else {
                console.error('获取菜单失败:', res.message)
                // 使用模拟数据
                menuTree.value = getMockMenuData()
                initialized.value = true
            }
        } catch (error) {
            console.error('菜单请求异常:', error)
            console.warn('后端API不可用，使用模拟菜单数据')
            
            // 当后端不可用时，使用模拟数据
            menuTree.value = getMockMenuData()
            initialized.value = true
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取模拟菜单数据（当后端不可用时使用）
     */
    const getMockMenuData = (): MenuItem[] => {
        // 从localStorage获取用户信息来判断角色
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const roleId = userInfo.roleId || 1

        console.log('生成模拟菜单数据，用户角色:', roleId)

        // 基础菜单
        const baseMenus: MenuItem[] = [
            {
                menuId: 1,
                parentId: 0,
                menuName: '首页',
                path: 'home',
                component: 'common/Home',
                permissionCode: 'common:viewHome',
                icon: 'Home',
                orderNum: 1,
                menuType: 2,
                status: 1,
                children: []
            }
        ]

        // 教师角色菜单 - 只显示不需要clubId的管理菜单
        if (roleId === 1) {
            baseMenus.push(
                {
                    menuId: 2,
                    parentId: 0,
                    menuName: '后台管理',
                    path: 'admin',
                    component: 'layout/BlankLayout',
                    permissionCode: 'admin:access',
                    icon: 'Setting',
                    orderNum: 2,
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
                            orderNum: 1,
                            menuType: 2,
                            status: 1,
                            children: []
                        },
                        {
                            menuId: 9,
                            parentId: 2,
                            menuName: '系统管理',
                            path: 'admin/system',
                            component: 'layout/BlankLayout',
                            permissionCode: 'sys:manage',
                            icon: 'Lock',
                            orderNum: 99,
                            menuType: 1,
                            status: 1,
                            children: [
                                {
                                    menuId: 10,
                                    parentId: 9,
                                    menuName: '用户管理',
                                    path: 'admin/system/users',
                                    component: 'admin/system/UserManage',
                                    permissionCode: 'sys:manageUsers',
                                    icon: 'User',
                                    orderNum: 1,
                                    menuType: 2,
                                    status: 1,
                                    children: []
                                },
                                {
                                    menuId: 11,
                                    parentId: 9,
                                    menuName: '角色管理',
                                    path: 'admin/system/roles',
                                    component: 'admin/system/RoleManage',
                                    permissionCode: 'sys:manageRoles',
                                    icon: 'UserFilled',
                                    orderNum: 2,
                                    menuType: 2,
                                    status: 1,
                                    children: []
                                },
                                {
                                    menuId: 12,
                                    parentId: 9,
                                    menuName: '权限管理',
                                    path: 'admin/system/permissions',
                                    component: 'admin/system/PermissionManage',
                                    permissionCode: 'sys:managePermissions',
                                    icon: 'Lock',
                                    orderNum: 3,
                                    menuType: 2,
                                    status: 1,
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            )
        }
        // 其他角色的菜单可以在这里添加
        else if (roleId >= 2 && roleId <= 6) {
            // 社团管理角色菜单
            baseMenus.push({
                menuId: 2,
                parentId: 0,
                menuName: '后台管理',
                path: 'admin',
                component: 'layout/BlankLayout',
                permissionCode: 'admin:access',
                icon: 'Setting',
                orderNum: 2,
                menuType: 1,
                status: 1,
                children: [
                    {
                        menuId: 4,
                        parentId: 2,
                        menuName: '我的社团',
                        path: 'admin/club/1/dashboard',
                        component: 'admin/club/ClubDashboard',
                        permissionCode: 'club:manage',
                        icon: 'Management',
                        orderNum: 2,
                        menuType: 2,
                        status: 1,
                        children: []
                    }
                ]
            })
        }

        return baseMenus
    }

    /**
     * 清空菜单（退出登录时调用）
     */
    const clearMenus = () => {
        menuTree.value = []
        initialized.value = false
    }

    /**
     * 扁平化菜单（用于路由注册）
     */
    const flattenMenus = (menus: MenuItem[] = menuTree.value): MenuItem[] => {
        const result: MenuItem[] = []
        const traverse = (items: MenuItem[]) => {
            items.forEach(item => {
                result.push(item)
                if (item.children && item.children.length > 0) {
                    traverse(item.children)
                }
            })
        }
        traverse(menus)
        return result
    }

    return {
        menuTree,
        loading,
        initialized,
        fetchUserMenus,
        clearMenus,
        flattenMenus
    }
})