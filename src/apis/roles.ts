// src/apis/roles.ts
import request from '@/utils/request'
import type { AssignRoleDTO, RolesVO } from '@/types/roles'
import type { IPage, PaginationParams, Result } from '@/apis/common'
import { fetchPaginatedData } from '@/apis/common'

// ----------------------
// 🔧 常量定义
// ----------------------
const API_PATH = {
    ASSIGN_ROLE: '/roles/assignRole',
    DISABLE_ROLE: '/roles/disableRole',
    ENABLE_ROLE: '/roles/enableRole',
    GET_ALL_ROLES: '/roles/getAllRoles'
}

// ----------------------
// 🧱 类型定义（可选）
// ----------------------
export type RoleActionResponse = Result<void>

// ----------------------
// 🔐 角色管理相关
// ----------------------
/**
 * 为用户分配角色
 * @param dto 分配角色参数
 */
export const assignRoleService = async (dto: AssignRoleDTO): Promise<RoleActionResponse> => {
    const response = await request.post(API_PATH.ASSIGN_ROLE, dto)
    return response.data
}

/**
 * 禁用角色
 * @param roleId 角色ID
 */
export const disableRoleService = async (roleId: number): Promise<RoleActionResponse> => {
    const response = await request.patch(`${API_PATH.DISABLE_ROLE}/${roleId}`)
    return response.data
}

/**
 * 启用角色
 * @param roleId 角色ID
 */
export const enableRoleService = async (roleId: number): Promise<RoleActionResponse> => {
    const response = await request.patch(`${API_PATH.ENABLE_ROLE}/${roleId}`)
    return response.data
}

/**
 * 获取所有角色（分页）
 */
export const getAllRolesService = async (
    params: PaginationParams = {}
): Promise<Result<IPage<RolesVO>>> => {
    return fetchPaginatedData(API_PATH.GET_ALL_ROLES, params)
}