import request from '@/utils/request'
import type { Result, IPage } from './common'
import type { ClubActivityVO } from '@/types/activity'

export const createClubActivityService = async (data: {
    clubId: number
    activityName: string
    description: string
    startTime: string
    endTime: string
    location: string
}): Promise<Result> => {
    const res = await request.post('/clubActivities/create', data)
    return res.data
}

// ✅ ✅ ✅ 修改此函数：支持可选 keyword 参数
export const getClubActivitiesByClubIdService = async (
    clubId: number,
    pageNum = 1,
    pageSize = 10,
    keyword?: string
): Promise<Result<IPage<ClubActivityVO>>> => {
    const res = await request.get(`/clubActivities/getByClubId/${clubId}`, {
        params: { pageNum, pageSize, keyword: keyword || '' }
    })
    return res.data
}

export const deleteClubActivityService = (activityId: number): Promise<Result> => {
    return request.delete(`/clubActivities/delete/${activityId}`)
}

export const getClubActivityByIdService = (activityId: number): Promise<Result<ClubActivityVO>> => {
    return request.get(`/clubActivities/getById/${activityId}`)
}
