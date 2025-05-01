// src/apis/permissions.ts
import request from '@/utils/request'
import type { AssignPermissionDTO, PermissionsVO } from '@/types/permissions'
import type {IPage, PaginationParams, Result} from '@/apis/common'
import { fetchPaginatedData } from '@/apis/common'

// ----------------------
// 🔧 常量定义
// ----------------------
const API_PATH = {
    ASSIGN_PERMISSION: '/permissions/assignPermission',
    DISABLE_PERMISSION: '/permissions/disablePermission',
    ENABLE_PERMISSION: '/permissions/enablePermission',
    GET_ALL_PERMISSIONS: '/permissions/getAllPermissions'
}

// ----------------------
// 🧱 类型定义（可选）
// ----------------------
export type PermissionActionResponse = Result<void>

// ----------------------
// 🔐 权限管理相关
// ----------------------
/**
 * 分配权限给用户
 * @param data 分配权限参数
 */
export const assignPermission = async (data: AssignPermissionDTO): Promise<PermissionActionResponse> => {
    const response = await request.post(API_PATH.ASSIGN_PERMISSION, data)
    return response.data
}

/**
 * 禁用权限
 * @param permissionId 权限ID
 */
export const disablePermission = async (permissionId: number): Promise<PermissionActionResponse> => {
    const response = await request.patch(`${API_PATH.DISABLE_PERMISSION}/${permissionId}`)
    return response.data
}

/**
 * 启用权限
 * @param permissionId 权限ID
 */
export const enablePermission = async (permissionId: number): Promise<PermissionActionResponse> => {
    const response = await request.patch(`${API_PATH.ENABLE_PERMISSION}/${permissionId}`)
    return response.data
}

/**
 * 获取所有权限（分页）
 */
export const getAllPermissions = async (
    params: PaginationParams = {}
): Promise<Result<IPage<PermissionsVO>>> => {
    return fetchPaginatedData(API_PATH.GET_ALL_PERMISSIONS, params)
}