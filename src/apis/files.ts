import request from '@/utils/request'
import type {
    FilesVO,
    IPageFilesVO,
    FileUploadParams,
    FileDeleteParams,
    GetFilesParams
} from '@/types/files'
import type {IPage, PaginationParams, Result} from '@/apis/common'
import { fetchPaginatedData } from '@/apis/common'

// ----------------------
// 📁 常量定义
// ----------------------
const API_PATH = {
    UPLOAD_FILE: '/files/upload',
    DELETE_FILE: '/files/delete',
    GET_FILES_BY_CLUB: '/files/getByClubId'
}

// ----------------------
// 📤 文件上传相关
// ----------------------

/**
* 上传文件
* @param clubId 社团ID
* @param fileType 文件类型
* @param file 文件对象
*/
export const uploadFileService = async (
    { clubId, fileType, file }: FileUploadParams
): Promise<Result<string>> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await request.post(
        `${API_PATH.UPLOAD_FILE}/${clubId}?fileType=${fileType}`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' }
        }
    )
    return response.data
}

// ----------------------
// 🗑️ 文件删除相关
// ----------------------

/**
* 删除文件
* @param fileId 文件ID
*/
export const deleteFileService = async (
    fileId: number
): Promise<Result<null>> => {
    const response = await request.delete(
        `${API_PATH.DELETE_FILE}/${fileId}`
    )
    return response.data
}

// ----------------------
// 📂 文件查询相关
// ----------------------

/**
* 根据社团ID分页获取文件列表
* @param clubId 社团ID
* @param params 分页参数
*/
export const getFilesByClubIdService = async (
    clubId: number,
    params: PaginationParams = {}
): Promise<Result<IPage<FilesVO>>> => {
    return fetchPaginatedData(
        `${API_PATH.GET_FILES_BY_CLUB}/${clubId}`,
        params
    )
}

// ----------------------
// 🛠️ 文件管理工具函数
// ----------------------

/**
* 获取文件下载URL
* @param fileUrl 文件相对路径
* @returns 完整的下载URL
*/
export const getFileDownloadUrl = (fileUrl: string): string => {
    return `${import.meta.env.VITE_API_BASE_URL}${fileUrl}`
}

/**
* 获取文件预览URL（适用于图片等可预览文件）
* @param fileUrl 文件相对路径
* @returns 完整的预览URL
*/
export const getFilePreviewUrl = (fileUrl: string): string => {
    return getFileDownloadUrl(fileUrl)
}