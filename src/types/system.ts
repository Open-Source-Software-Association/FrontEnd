// types/system.ts
import {Component} from "vue";

export interface TagItem {
    title: string
    path: string
    closable: boolean
}

export interface MenuItem {
    index: string
    title: string
    icon: Component
    requiredRole?: number // 可选角色权限标识
}