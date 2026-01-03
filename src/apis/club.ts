import request from '@/utils/request'
import type { Result } from './common'

// 社团信息类型
export interface Club {
    clubId: number
    clubName: string
    description: string
    founderUserId: number
    logoUrl: string
    status: number
    createdAt: string
    updatedAt: string
}

/**
 * 根据社团ID获取社团信息（使用新的简单接口）
 */
export const getClubByIdService = async (clubId: number): Promise<Result<Club>> => {
    const response = await request.get(`/clubs/${clubId}`)
    return response.data
}

/**
 * 获取所有社团列表（使用新的简单接口）
 */
export const getAllClubsService = async (pageNum: number = 1, pageSize: number = 10): Promise<Result<any>> => {
    const response = await request.get(`/clubs/list`, {
        params: { pageNum, pageSize }
    })
    return response.data
}

/**
 * 根据关键字搜索社团（使用新的简单接口）
 */
export const getClubsListByKeywordService = async (keyword: string, pageNum: number = 1, pageSize: number = 10): Promise<Result<any>> => {
    const response = await request.get(`/clubs/search`, {
        params: { keyword, pageNum, pageSize }
    })
    return response.data
}

/**
 * 创建社团
 */
export const createClubService = async (data: {
    clubName: string
    description: string
    logoUrl?: string
}): Promise<Result<any>> => {
    const response = await request.post(`/clubs/create`, data)
    return response.data
}

/**
 * 启用社团
 */
export const enableClubService = async (clubId: number): Promise<Result<any>> => {
    const response = await request.patch(`/clubs/enable/${clubId}`)
    return response.data
}

/**
 * 禁用社团
 */
export const disableClubService = async (clubId: number): Promise<Result<any>> => {
    const response = await request.patch(`/clubs/disable/${clubId}`)
    return response.data
}

/**
 * 更新社团信息
 */
export const updateClubService = async (data: {
    clubId: number
    clubName: string
    description: string
    logoUrl?: string
}): Promise<Result<any>> => {
    const response = await request.patch(`/clubs/update`, data)
    return response.data
}