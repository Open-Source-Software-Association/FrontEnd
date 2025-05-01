// src/apis/common.ts
import {AxiosRequestConfig} from 'axios'
import request from '@/utils/request'

// ----------------------
// 🧱 类型定义
// ----------------------
export interface Result<T = any> {
    code: number
    message: string
    data: T
}

export interface OrderItem {
    column: string
    asc: boolean
}

export interface IPage<T> {
    records: T[]
    total?: number // 可选字段
    size?: number
    current?: number
    pages?: number
    orders?: OrderItem[]
    optimizeCountSql?: boolean
    searchCount?: boolean
}

// ----------------------
// 📦 分页参数类型
// ----------------------
export type PaginationParams = {
    pageNum?: number
    pageSize?: number
}

// ----------------------
// 🧰 默认值常量
// ----------------------
const DEFAULT_PAGE_DATA: Partial<IPage<any>> = {
    records: [],
    total: 0,
    size: 10,
    current: 1,
    pages: 0,
    orders: [],
    optimizeCountSql: true,
    searchCount: true
}

// ----------------------
// 📄 标准化分页响应格式
// ----------------------
export const handlePaginationResponse = <T>(
    response: Result<IPage<T>> | undefined
): Result<IPage<T>> => {
    if (!response) {
        console.warn('响应数据为空或无效')
        return {
            code: -1,
            message: '响应数据为空或无效',
            data: { ...DEFAULT_PAGE_DATA } as IPage<T>
        }
    }

    const data = response.data || ({} as IPage<T>)

    return {
        ...response,
        data: {
            records: data.records ?? DEFAULT_PAGE_DATA.records,
            total: data.total ?? DEFAULT_PAGE_DATA.total,
            size: data.size ?? DEFAULT_PAGE_DATA.size,
            current: data.current ?? DEFAULT_PAGE_DATA.current,
            pages: data.pages ?? DEFAULT_PAGE_DATA.pages,
            orders: data.orders ?? DEFAULT_PAGE_DATA.orders,
            optimizeCountSql: data.optimizeCountSql ?? DEFAULT_PAGE_DATA.optimizeCountSql,
            searchCount: data.searchCount ?? DEFAULT_PAGE_DATA.searchCount
        }
    }
}

// ----------------------
// 📡 通用分页请求封装
// ----------------------
export const fetchPaginatedData = async <T>(
    url: string,
    params: PaginationParams & Record<string, any>,
    config?: AxiosRequestConfig
): Promise<Result<IPage<T>>> => {
    try {
        const response = await request.get(url, {
            params,
            ...config
        })
        return handlePaginationResponse(response.data)
    } catch (error) {
        console.error('请求失败:', error)
        return {
            code: -1,
            message: '请求失败',
            data: { ...DEFAULT_PAGE_DATA } as IPage<T>
        }
    }
}