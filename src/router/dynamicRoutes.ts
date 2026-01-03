import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/apis/menus'

// 显式组件映射 - 更安全的方式
const componentMap: Record<string, () => Promise<any>> = {
  // 管理页面
  'admin/club/ClubManage': () => import('@/views/admin/club/ClubManage.vue'),
  'admin/club/ClubDashboard': () => import('@/views/admin/club/ClubDashboard.vue'),
  
  // 社团管理子页面
  'admin/club/departments/DepartmentManage': () => import('@/views/admin/club/departments/DepartmentManage.vue'),
  'admin/club/departments/DepartmentDetail': () => import('@/views/admin/club/departments/DepartmentDetail.vue'),
  'admin/club/activities/ActivityManage': () => import('@/views/admin/club/activities/ActivityManage.vue'),
  'admin/club/activities/ActivityDetail': () => import('@/views/admin/club/activities/ActivityDetail.vue'),
  'admin/club/activities/ActivityEdit': () => import('@/views/admin/club/activities/ActivityEdit.vue'),
  'admin/club/files/FileManage': () => import('@/views/admin/club/files/FileManage.vue'),
  'admin/club/members/MemberManage': () => import('@/views/admin/club/members/MemberManage.vue'),
  
  // 系统管理页面
  'admin/system/UserManage': () => import('@/views/admin/system/UserManage.vue'),
  'admin/system/RoleManage': () => import('@/views/admin/system/RoleManage.vue'),
  'admin/system/PermissionManage': () => import('@/views/admin/system/PermissionManage.vue'),
  
  // 通用页面
  'common/Home': () => import('@/views/common/Home.vue'),
  'layout/BlankLayout': () => import('@/views/layout/BlankLayout.vue'),
}

/**
 * 获取异步组件 - 带错误处理的安全版本
 */
const getAsyncComponent = (component: string) => {
    if (!component) {
        console.warn('Component path is empty')
        return null
    }

    // 首先尝试从显式映射中获取
    const mappedComponent = componentMap[component]
    if (mappedComponent) {
        console.log(`找到映射组件: ${component}`)
        // 包装组件加载，添加错误处理
        return () => mappedComponent().catch(error => {
            console.error(`组件加载失败: ${component}`, error)
            // 返回错误组件
            return Promise.resolve({
                template: `
                    <div class="error-component" style="padding: 20px; text-align: center;">
                        <el-alert title="组件加载失败" type="error" :closable="false" show-icon>
                            <p>组件路径: ${component}</p>
                            <p>错误信息: ${error.message}</p>
                            <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
                        </el-alert>
                    </div>
                `
            })
        })
    }

    // 如果映射中没有，记录警告并返回错误组件
    console.warn(`Component not found in map: ${component}`)
    console.warn('Available components:', Object.keys(componentMap))
    
    // 返回一个错误组件
    return () => Promise.resolve({
        template: `
            <div class="error-component" style="padding: 20px; text-align: center;">
                <el-alert title="组件未找到" type="warning" :closable="false" show-icon>
                    <p>请求的组件: ${component}</p>
                    <p>该组件未在路由映射中注册</p>
                    <p>可用组件: ${Object.keys(componentMap).join(', ')}</p>
                    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
                </el-alert>
            </div>
        `
    })
}

/**
 * 转换菜单为路由 - 扁平化处理，正确处理参数路径
 */
export const convertMenusToRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
    const routes: RouteRecordRaw[] = []
    
    const processMenu = (menu: MenuItem) => {
        if (menu.status !== 1 || menu.menuType === 3) return // 跳过禁用菜单和按钮
        
        if (menu.menuType === 2 && menu.component) {
            // 只处理菜单类型，生成实际路由
            const componentModule = getAsyncComponent(menu.component)
            
            if (componentModule) {
                // 确保路径以 / 开头，作为绝对路径
                let routePath = menu.path
                if (!routePath.startsWith('/')) {
                    routePath = '/' + routePath
                }
                
                const route: RouteRecordRaw = {
                    path: routePath,
                    name: `Menu_${menu.menuId}`,
                    component: componentModule,
                    meta: {
                        title: menu.menuName,
                        icon: menu.icon,
                        permission: menu.permissionCode,
                        menuId: menu.menuId,
                        requiresAuth: true
                    }
                }
                
                console.log(`生成路由: ${routePath} -> ${menu.component}`)
                routes.push(route)
            } else {
                console.error(`无法为菜单 ${menu.menuName} 创建路由，组件 ${menu.component} 不存在`)
            }
        }
        
        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
            menu.children.forEach(child => processMenu(child))
        }
    }
    
    try {
        menus.forEach(menu => processMenu(menu))
        console.log('动态路由生成完成，共生成路由数量:', routes.length)
        console.log('所有生成的路由:', routes.map(r => ({ path: r.path, name: r.name, component: r.component })))
    } catch (error) {
        console.error('生成动态路由时发生错误:', error)
    }
    
    return routes
}

/**
 * 添加路由到路由器的安全方法 - 修复版本，确保正确嵌套在Layout中
 */
export const addRoutesToRouter = (router: any, routes: RouteRecordRaw[]) => {
    const addedRoutes: string[] = []
    const failedRoutes: string[] = []
    
    routes.forEach(route => {
        try {
            // 将动态路由添加为Layout的子路由，而不是顶级路由
            router.addRoute('Layout', route)  // 'Layout' 是Layout路由的name，将动态路由作为其子路由
            addedRoutes.push(route.path)
            console.log(`成功添加路由到Layout: ${route.path}`)
        } catch (error) {
            failedRoutes.push(route.path)
            console.error(`添加路由失败: ${route.path}`, error)
        }
    })
    
    console.log(`路由添加完成 - 成功: ${addedRoutes.length}, 失败: ${failedRoutes.length}`)
    if (failedRoutes.length > 0) {
        console.warn('失败的路由:', failedRoutes)
    }
    
    return { addedRoutes, failedRoutes }
}