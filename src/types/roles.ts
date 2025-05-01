export interface AssignRoleDTO {
    userId: number;
    roleId: number;
}

export interface RolesVO {
    roleId: number;
    roleName: string;
    description: string;
    status: number;
    createTime: string;
}