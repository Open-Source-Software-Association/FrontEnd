export interface AssignPermissionDTO {
    userId: number;
    permissionId: number;
}

export interface PermissionsVO {
    permissionId: number;
    permissionName: string;
    description: string;
    status: number;
    updatedAt: string;
}