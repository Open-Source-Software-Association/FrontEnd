<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
<!--    <el-alert-->
<!--        title="欢迎您使用安徽师范大学社团管理系统"-->
<!--        type="success"-->
<!--        show-icon-->
<!--        class="welcome-banner"-->
<!--        :closable="false"-->
<!--    />-->

    <!-- 顶部统计卡片 -->
    <div class="card-panel">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-title">社团总数</div>
        <div class="stat-value">15</div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-title">注册成员</div>
        <div class="stat-value">458</div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-title">本月活动</div>
        <div class="stat-value">12</div>
      </el-card>
      <el-card class="stat-card" shadow="hover">
        <div class="stat-title">待审批</div>
        <div class="stat-value">3</div>
      </el-card>
    </div>

    <!-- 图表部分 -->
    <div class="chart-panel">
      <el-card class="chart-box" shadow="never">
        <template #header>社团活动发布趋势</template>
        <v-chart :option="activityTrendOption" autoresize style="height: 300px;" />
      </el-card>
      <el-card class="chart-box" shadow="never">
        <template #header>成员专业分布</template>
        <v-chart :option="majorPieOption" autoresize style="height: 300px;" />
      </el-card>
    </div>

    <!-- 公告 & 快捷入口 -->
    <div class="bottom-panel">
      <el-card class="announcement-card" shadow="never">
        <template #header>系统公告</template>
        <ul>
          <li>2025-05-06：系统更新，优化导入导出功能。</li>
          <li>2025-04-28：新增活动审批模块。</li>
          <li>2025-04-15：修复若干小问题。</li>
        </ul>
      </el-card>

      <el-card class="quick-card" shadow="never">
        <template #header>快捷操作</template>
        <el-button type="primary" plain>创建社团</el-button>
        <el-button type="success" plain>发布活动</el-button>
        <el-button type="warning" plain>导入成员</el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activityTrendOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '活动数量',
      type: 'line',
      data: [5, 7, 10, 6, 12],
      smooth: true
    }
  ]
})

const majorPieOption = ref({
  tooltip: { trigger: 'item' },
  legend: { top: 'bottom' },
  series: [
    {
      name: '专业分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      data: [
        { value: 104, name: '计算机' },
        { value: 78, name: '通信工程' },
        { value: 56, name: '软件工程' },
        { value: 42, name: '人工智能' },
        { value: 33, name: '物联网' }
      ]
    }
  ]
})
</script>

<style scoped>


.dashboard-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-panel {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: -25px; /* 原来可能是 24px 或更大，适当调小 */
  gap: 16px;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  text-align: center;
}

.stat-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}


.chart-panel {
  display: flex;
  gap: 20px;
}

.chart-box {
  flex: 1;
}

.bottom-panel {
  display: flex;
  gap: 20px;
}

.announcement-card,
.quick-card {
  flex: 1;
}
</style>
