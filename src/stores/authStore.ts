import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';  // 使用 vueuse 实现持久化存储
import type {InfoVO} from "@/types/users";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: useStorage<string>('token', ''),  // token 持久化
        userInfo: useStorage<InfoVO | Record<string, never>>('userInfo', {}),  // 使用空对象初始化
        currentClub: useStorage<any>('currentClub', null),  // 当前管理的社团
    }),
    getters: {
        // 获取用户角色名称
        roleName: (state) => {
            const roleMap: Record<number, string> = {
                1: '教师',
                2: '会长',
                3: '副会长',
                4: '部长',
                5: '副部长',
                6: '工作人员',
                7: '学生会员'
            }
            return roleMap[(state.userInfo as InfoVO)?.roleId] || '未知'
        },
        
        // 判断是否可以访问后台管理
        canAccessAdmin: (state) => {
            const roleId = (state.userInfo as InfoVO)?.roleId
            return roleId && roleId <= 6  // 1-6号角色可以访问后台
        },
        
        // 判断是否是教师（可以管理所有社团）
        isTeacher: (state) => {
            return (state.userInfo as InfoVO)?.roleId === 1
        },
        
        // 获取用户所属社团ID
        userClubId: (state) => {
            return (state.userInfo as InfoVO)?.clubId
        }
    },
    actions: {
        // 设置 token
        setToken(newToken: string) {
            this.token = newToken;
        },
        // 设置用户信息
        setUserInfo(newUserInfo: InfoVO | null) {
            if (newUserInfo) {
                this.userInfo = newUserInfo;
            }
        },
        // 设置当前管理的社团
        setCurrentClub(club: any) {
            this.currentClub = club;
        },
        // 清除认证信息
        clearAuth() {
            this.token = '';
            this.userInfo = {};  // 清除时设置为空对象
            this.currentClub = null;
        }
    },
});
