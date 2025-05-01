import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';  // 使用 vueuse 实现持久化存储
import type {InfoVO} from "@/types/users";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: useStorage<string>('token', ''),  // token 持久化
        userInfo: useStorage<InfoVO | Record<string, never>>('userInfo', {}),  // 使用空对象初始化
    }),
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
        // 清除认证信息
        clearAuth() {
            this.token = '';
            this.userInfo = {};  // 清除时设置为空对象
        }
    },
});
