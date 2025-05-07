// src/apis/clubMember.ts
import request from '@/utils/request'
import type { Result, IPage } from './common'
import type { ClubMemberFullInfoVO } from '@/types/member'

// 获取社团成员列表
export const getClubMembersService = (
    clubId: number,
    pageNum = 1,
    pageSize = 1000
) => {
    return request.get<Result<IPage<ClubMemberFullInfoVO>>>(
        `/clubMembers/list/${clubId}`,
        {
            params: { pageNum, pageSize }
        }
    )
}

// 导入社团部门成员
export const importDepartmentMembersService = (
    clubId: number,
    departmentId: number,
    file: File
): Promise<Result> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post(`/importUser/import/${clubId}/${departmentId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 导出社团所有成员
export const exportClubMembersService = (clubId: number): Promise<Blob> => {
    return request.get(`/exportUser/export/${clubId}`, {
        responseType: 'blob'
    })
}

// 导出社团部门成员
export const exportDepartmentMembersService = (
    clubId: number,
    departmentId: number
): Promise<Blob> => {
    return request.get(`/exportUser/export/${clubId}/${departmentId}`, {
        responseType: 'blob'
    })
}


// 获取部门成员列表
export const getDepartmentMembersService = (
    departmentId: number,
    pageNum = 1,
    pageSize = 100
): Promise<Result<IPage<ClubMemberFullInfoVO>>> => {
    return request.get(`/clubMembers/listByDepartmentId/${departmentId}`, {
        params: { pageNum, pageSize }
    })
}
