import request from '@/utils/request'
import type { CreateClubDTO, UpdateClubDTO, ClubVO } from '@/types/club'
import type { IPage, PaginationParams, Result } from './common'

// 获取社团分页列表
export const getClubListService = (params: PaginationParams & { keyword?: string }) =>
    request.get<Result<IPage<ClubVO>>>('/clubs/listByKeyword', { params })

// 创建社团
export const createClubService = (data: CreateClubDTO) =>
    request.post('/clubs/create', data)

// 根据 ID 获取社团详情
export const getClubByIdService = (clubId: number) =>
    request.get<Result<ClubVO>>(`/clubs/getById/${clubId}`)

// 修改社团信息
export const updateClubService = (data: UpdateClubDTO) =>
    request.patch<Result<null>>('/clubs/update', data)

// 上传社团 Logo
export const uploadClubLogoService = (formData: FormData) =>
    request.post<Result<string>>('/clubs/uploadLogo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })


// 启用社团
export const enableClubService = (clubId: number) =>
    request.patch<Result<null>>(`/clubs/enable/${clubId}`)

// 禁用社团
export const disableClubService = (clubId: number) =>
    request.patch<Result<null>>(`/clubs/disable/${clubId}`)
