export interface Result<T = any> {
    code: number
    message: string
    data: T
}

// src/types/common.d.ts 或 src/types/index.ts
export interface IPage<T = any> {
    records: T[]
    total: number  // ✅ 改成必填字段
    size?: number
    current?: number
}
