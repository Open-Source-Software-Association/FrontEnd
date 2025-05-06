<template>
  <el-card class="form-card">
    <template #header>
      <div><strong>社团：</strong>{{ club?.clubName || '加载中...' }}</div>
      <div><strong>创建人：</strong>{{ club?.founderUserName || '，，，，' }}</div>
    </template>

    <div><strong>简介：</strong>{{ club?.description || '暂无' }}</div>

    <hr style="margin: 16px 0;" />

    <DepartmentList :club-id="clubId" />
  </el-card>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClubByIdService } from '@/apis/club'
import DepartmentList from './components/DepartmentList.vue'
import type { ClubVO } from '@/types/club'

const route = useRoute()
const clubId = Number(route.params.clubId)
const club = ref<ClubVO>()

onMounted(async () => {
  try {
    const res = await getClubByIdService(clubId)
    if (res.data.code === 0 || res.data.code === 200) {
      club.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取社团信息失败')
    }
  } catch (err) {
    ElMessage.error('请求异常，获取社团信息失败')
  }
})

</script>

