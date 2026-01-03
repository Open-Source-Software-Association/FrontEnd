import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserMenuTreeService, type MenuItem } from '@/apis/menus'

export const useMenuPermissionStore = defineStore('menuPermission', () => {
    // 状态
    const menus = ref<MenuItem[]>([])
    const permissions = ref<string[]>([])
    const loading = ref(false)
    const loaded = ref(false)

    // 计算属性
    const hasPermission = computed(() => {
        return (permission: string) => {
            return permissions.value.includes(permission)
        }
    })

    const flatMenus = computed(() => {
        const result: MenuItem[] = []
        const traverse = (menuList: MenuItem[]) => {
            menuList.forEach(menu => {
                result.push(menu)
                if (menu.children && menu.children.length > 0) {
                    traverse(menu.children)
                }
            })
        }
        traverse(menus.value)
        return result
    })

    // 方法
    /**
     * 加载用户菜单和权限
     */
    const loadMenusAndPermissions = async () => {
        try {
            loading.value = true
            const response = await getUserMenuTreeService()

            if (response.code === 0 || response.code === 200) {
                menus.value = response.data || []
                // 从菜单权限码提取权限
                extractPermissions(menus.value)
                loaded.value = true
            } else {
                console.error('Failed to load menus:', response.message)
                // 使用模拟数据
                const mockData = getMockMenuAndPermissionData()
                menus.value = mockData.menus
                permissions.value = mockData.permissions
                loaded.value = true
            }
        } catch (error) {
            console.error('Error loading menus:', error)
            console.warn('后端API不可用，使用模拟权限数据')
            
            // 使用模拟数据
            const mockData = getMockMenuAndPermissionData()
            menus.value = mockData.menus
            permissions.value = mockData.permissions
            loaded.value = true
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取模拟菜单和权限数据
     */
    const getMockMenuAndPermissionData = () => {
        // 从localStorage获取用户信息来判断角色
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const roleId = userInfo.roleId || 1

        console.log('生成模拟权限数据，用户角色:', roleId)

        let mockPermissions: string[] = []
        let mockMenus: MenuItem[] = []

        // 教师角色权限
        if (roleId === 1) {
            mockPermissions = [
                'common:viewHome',
                'admin:access',
                'admin:manageAllClubs',
                'sys:manage',
                'sys:manageUsers',
                'sys:manageRoles',
                'sys:managePermissions',
                'club:manage',
                'dept:manageDepartment',
                'activity:manage',
                'file:manage',
                'member:manage'
            ]
        }
        // 其他角色权限
        else if (roleId >= 2 && roleId <= 6) {
            mockPermissions = [
                'common:viewHome',
                'admin:access',
                'club:manage'
            ]
        }

        return {
            menus: mockMenus,
            permissions: mockPermissions
        }
    }

    /**
     * 从菜单树中提取权限代码
     */
    const extractPermissions = (menuList: MenuItem[]) => {
        const permSet = new Set<string>()

        const traverse = (items: MenuItem[]) => {
            items.forEach(item => {
                if (item.permissionCode) {
                    permSet.add(item.permissionCode)
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children)
                }
            })
        }

        traverse(menuList)
        permissions.value = Array.from(permSet)
    }

    /**
     * 检查权限
     */
    const checkPermission = (permission: string): boolean => {
        return permissions.value.includes(permission)
    }

    /**
     * 根据路径查找菜单
     */
    const findMenuByPath = (path: string): MenuItem | null => {
        const findInMenus = (menuList: MenuItem[]): MenuItem | null => {
            for (const menu of menuList) {
                if (menu.path === path) {
                    return menu
                }
                if (menu.children && menu.children.length > 0) {
                    const found = findInMenus(menu.children)
                    if (found) return found
                }
            }
            return null
        }
        return findInMenus(menus.value)
    }

    /**
     * 清空菜单和权限
     */
    const clearMenus = () => {
        menus.value = []
        permissions.value = []
        loaded.value = false
    }

    return {
        menus,
        permissions,
        loading,
        loaded,
        hasPermission,
        flatMenus,
        loadMenusAndPermissions,
        checkPermission,
        findMenuByPath,
        clearMenus
    }
})