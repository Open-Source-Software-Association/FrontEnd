export interface OrderItem {
    column: string;
    asc: boolean;
}

export enum FileType {
    IMAGE = 0,
    VIDEO = 1,
    AUDIO = 2,
    DOCUMENT = 3,
    OTHER = 4
}

export interface FilesVO {
    fileId: number;          // 主键ID (对应 file_id)
    fileName: string;        // 文件名称
    fileUrl: string;         // 文件链接
    uploadedBy: number;      // 上传者用户ID
    fileType: number;      // 文件类型（1: 图片, 2: 视频, 3: 文档）
    uploadedByName?: string; // 上传者昵称（可选）
    clubId?: number;         // 所属社团ID（可选）
    createdAt: string;        // 创建时间
}

export interface IPageFilesVO {
    records: FilesVO[];      // 文件记录列表
    total: number;           // 总记录数
    size: number;            // 每页大小
    current: number;         // 当前页码
    orders: OrderItem[];     // 排序信息
    optimizeCountSql: boolean;
    searchCount: boolean;
    optimizeJoinOfCountSql: boolean;
    maxLimit: number;
    countId: string;
    pages: number;           // 总页数
}

export interface Result<T = any> {
    code: number;            // 状态码（2xx:成功,4xx:客户端错误,5xx:服务端错误,6xxxx:自定义业务错误码）
    message: string;         // 人类可读的提示信息
    data: T | null;          // 响应数据（成功时返回）
}

export interface ResultString extends Result<string> {}
export interface ResultIPageFilesVO extends Result<IPageFilesVO> {}

// 文件上传请求参数
export interface FileUploadParams {
    clubId: number;          // 路径参数 - 社团ID
    fileType: number;        // 查询参数 - 文件类型
    file: File;              // 表单数据 - 上传的文件
}

// 文件删除请求参数
export interface FileDeleteParams {
    fileId: number;          // 路径参数 - 文件ID
}

// 获取文件列表请求参数
export interface GetFilesParams {
    clubId: number;          // 路径参数 - 社团ID
    pageNum?: number;        // 查询参数 - 页码（默认1）
    pageSize?: number;       // 查询参数 - 每页记录数（默认10）
}