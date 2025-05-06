export interface InfoDTO {
    phone: string;
    nickName: string;
    email: string;
    jobNumber: string;
    gender: number;
    college: string;
    major: string;
    grade: number;
}

export interface LoginDTO {
    jobNumber: string;
    password: string;
}

export interface RegisterDTO {
    nickName: string;
    jobNumber: string;
    password: string;
}

export interface UpdatePwdDTO {
    oldPwd: string;
    newPwd: string;
    confirmPwd: string;
}

export interface InfoVO {
    userId: number;
    roleId: number;
    clubId: number;
    departmentId: number;
    phone: string;
    nickName: string;
    email: string;
    avatarUrl: string;
    jobNumber: string;
    gender: number;
    college: string;
    major: string;
    grade: string;
}

export interface LoginVO {
    token: string;
}

export interface UserWithRoleVO {
    userId: number;
    jobNumber: string;
    nickName: string;
    roleId: number;
    roleName: string;
}