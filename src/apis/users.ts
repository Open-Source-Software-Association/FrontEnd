import request from '@/utils/request'
import type {
    InfoVO,
    LoginDTO,
    LoginVO,
    UserWithRoleVO,
    RegisterDTO
} from '@/types/users'

import type { IPage, PaginationParams, Result } from '@/apis/common'
import { fetchPaginatedData } from '@/apis/common'


// ----------------------
// 🔧 常量定义
// ----------------------
const API_PATH = {
    LOGIN: '/users/login',
    INFO: '/users/info',
    REGISTER: '/users/register',
    GET_USERS_BY_ROLE_ID: '/users/getUsersByRoleId',
    SEARCH_USERS: '/users/getUsersByKeyword',
    UPDATE_INFO: '/users/updateInfo',
    UPDATE_PASSWORD: '/users/updatePassword',
    UPDATE_AVATAR: '/users/updateAvatar'
}

// ----------------------
// 🔐 用户认证相关
// ----------------------
export const userLoginService = async (loginDTO: LoginDTO): Promise<Result<LoginVO>> => {
    const response = await request.post(API_PATH.LOGIN, loginDTO)
    return response.data
}

export const userRegisterService = async (registerDTO: RegisterDTO): Promise<Result<null>> => {
    const response = await request.post(API_PATH.REGISTER, registerDTO)
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
        keyword,
        ...params
    })
}

// ----------------------
// 🛠 用户信息管理功能
// ----------------------

// 更新用户信息
export const updateUserInfoService = async (data: Partial<InfoVO>): Promise<Result<null>> => {
    const response = await request.patch(API_PATH.UPDATE_INFO, data)
    return response.data
}

// 修改密码
export const updatePasswordService = async (data: {
    oldPwd: string
    newPwd: string
    confirmPwd: string
}): Promise<Result<null>> => {
    const response = await request.patch(API_PATH.UPDATE_PASSWORD, data)
    return response.data
}

// 上传头像
export const uploadAvatarService = async (formData: FormData): Promise<Result<null>> => {
    const response = await request.patch(API_PATH.UPDATE_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}
