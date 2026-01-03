import request from '@/utils/request'
import type { Result } from './common'

// 菜单类型定义
export interface MenuItem {
    menuId: number
    parentId: number
    menuName: string
    path: string
    component: string
    permissionCode: string
    icon: string
    sortOrder: number
    menuType: number // 1-目录, 2-菜单, 3-按钮
    status: number
    children?: MenuItem[]
}

/**
 * 获取当前用户的菜单树
 */
export const getUserMenuTreeService = async (): Promise<Result<MenuItem[]>> => {
    const response = await request.get('/menus/tree')
    return response.data
}

/**
 * 获取所有菜单（管理员专用）
 */
export const getAllMenusService = async (): Promise<Result<MenuItem[]>> => {
    const response = await request.get('/menus/all')
    return response.data
}