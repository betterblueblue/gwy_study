<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>学习进度</span>
            </div>
          </template>
          <el-progress
            type="dashboard"
            :percentage="75"
            :color="progressColor"
          />
          <div class="progress-info">
            <p>今日学习时长：2小时</p>
            <p>连续学习天数：7天</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>错题统计</span>
            </div>
          </template>
          <div class="mistakes-stats">
            <el-statistic title="今日错题数" :value="5">
              <template #suffix>
                <span class="suffix-label">道</span>
              </template>
            </el-statistic>
            <el-divider direction="vertical" />
            <el-statistic title="待复习错题" :value="28">
              <template #suffix>
                <span class="suffix-label">道</span>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>考试倒计时</span>
            </div>
          </template>
          <el-statistic title="距离考试还有" :value="98">
            <template #suffix>
              <span class="suffix-label">天</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="plan-card">
      <template #header>
        <div class="card-header">
          <span>今日学习计划</span>
          <el-button type="primary" link>查看更多</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(task, index) in todayTasks"
          :key="index"
          :type="task.status"
          :timestamp="task.time"
        >
          {{ task.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const progressColor = computed(() => {
  return [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 }
  ]
})

const todayTasks = ref([
  {
    content: '行测：数量关系专项练习',
    time: '09:00-10:30',
    status: 'success'
  },
  {
    content: '申论：大作文写作技巧学习',
    time: '14:00-16:00',
    status: 'primary'
  },
  {
    content: '错题复习',
    time: '20:00-21:00',
    status: 'warning'
  }
])
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.overview-card {
  margin-bottom: 20px;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-info {
  margin-top: 20px;
  text-align: left;
}

.progress-info p {
  margin: 5px 0;
  color: #606266;
}

.mistakes-stats {
  display: flex;
  justify-content: center;
  align-items: center;
}

.suffix-label {
  margin-left: 4px;
  font-size: 14px;
  color: #606266;
}

.plan-card {
  margin-top: 20px;
}
</style>