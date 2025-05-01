// src/apis/users.ts
import request from '@/utils/request'
import type { InfoVO, LoginDTO, LoginVO, UserWithRoleVO } from '@/types/users'
import type {IPage, PaginationParams, Result} from '@/apis/common'
import {fetchPaginatedData} from '@/apis/common'

// ----------------------
// 🔧 常量定义
// ----------------------
const API_PATH = {
    LOGIN: '/users/login',
    INFO: '/users/info',
    GET_USERS_BY_ROLE_ID: '/users/getUsersByRoleId',
    SEARCH_USERS: '/users/getUsersByKeyword'
}

// ----------------------
// 🔐 用户认证相关
// ----------------------
export const userLoginService = async (loginDTO: LoginDTO): Promise<Result<LoginVO>> => {
    const response = await request.post(API_PATH.LOGIN, loginDTO)
    return response.data
}

export const getUserInfoService = async (): Promise<Result<InfoVO>> => {
    const response = await request.get(API_PATH.INFO)
    return response.data
}

// ----------------------
// 👥 用户管理相关
// ----------------------
export const getUsersByRoleIdService = async (
    roleId: number,
    params: PaginationParams = {}
): Promise<Result<IPage<UserWithRoleVO>>> => {
    return fetchPaginatedData(`${API_PATH.GET_USERS_BY_ROLE_ID}/${roleId}`, params)
}

export const searchUsersService = async (
    keyword: string,
    params: PaginationParams = {}
): Promise<Result<IPage<InfoVO>>> => {
    return fetchPaginatedData(API_PATH.SEARCH_USERS, {
        keyword, // 👈 直接作为顶层字段
        ...params // 👈 pageNum, pageSize 等分页参数也作为顶层字段
    });
};