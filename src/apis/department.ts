import request from '@/utils/request'
import type { Result, IPage } from './common'
import type { DepartmentsVO, CreateDepartmentDTO } from '@/types/department'

export const getDepartmentsByClubIdService = (
    clubId: number,
    pageNum = 1,
    pageSize = 5,
    keyword = ''
) => {
    const url = keyword
        ? `/departments/listByKeyword/${clubId}?pageNum=${pageNum}&pageSize=${pageSize}&keyword=${keyword}`
        : `/departments/list/${clubId}?pageNum=${pageNum}&pageSize=${pageSize}`
    return request.get<Result<IPage<DepartmentsVO>>>(url)
}

export const disableDepartmentService = (id: number) =>
    request.patch<Result<null>>(`/departments/disable/${id}`)

export const createDepartmentService = (data: CreateDepartmentDTO): Promise<Result> => {
    return request.post('/departments/create', data)
}
