<template>
  <div class="study-plan-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="plan-card">
          <template #header>
            <div class="card-header">
              <span>学习计划</span>
              <el-button type="primary" @click="dialogVisible = true">
                新建计划
              </el-button>
            </div>
          </template>
          <el-table :data="studyPlans" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="subject" label="科目" width="100" />
            <el-table-column prop="content" label="学习内容" />
            <el-table-column prop="duration" label="计划时长" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="completePlan(row)"
                  v-if="row.status !== '已完成'"
                >
                  完成
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="deletePlan(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>学习统计</span>
            </div>
          </template>
          <div class="stats-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="stats-item">
                  <div class="stats-value">{{ completedCount }}</div>
                  <div class="stats-label">已完成计划</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stats-item">
                  <div class="stats-value">{{ totalHours }}</div>
                  <div class="stats-label">总学习时长(小时)</div>
                </div>
              </el-col>
            </el-row>
            <el-progress
              :percentage="completionRate"
              :format="percentageFormat"
              class="progress"
            />
          </div>
        </el-card>

        <el-card class="calendar-card">
          <template #header>
            <div class="card-header">
              <span>学习日历</span>
            </div>
          </template>
          <el-calendar v-model="currentDate">
            <template #dateCell="{ data }">
              <div class="calendar-cell">
                <div>{{ data.day.split('-').slice(-1)[0] }}</div>
                <div class="calendar-indicator" v-if="hasStudyPlan(data.day)"></div>
              </div>
            </template>
          </el-calendar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建计划对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建学习计划"
      width="500px"
    >
      <el-form :model="newPlan" label-width="80px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="newPlan.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="科目">
          <el-select v-model="newPlan.subject" placeholder="选择科目" style="width: 100%">
            <el-option label="行测" value="行测" />
            <el-option label="申论" value="申论" />
          </el-select>
        </el-form-item>
        <el-form-item label="学习内容">
          <el-input
            v-model="newPlan.content"
            type="textarea"
            placeholder="请输入学习内容"
          />
        </el-form-item>
        <el-form-item label="计划时长">
          <el-input-number
            v-model="newPlan.duration"
            :min="0.5"
            :step="0.5"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createPlan">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 学习计划列表
const studyPlans = ref([
  {
    date: '2023-08-10',
    subject: '行测',
    content: '数量关系专项训练',
    duration: 2,
    status: '已完成'
  },
  {
    date: '2023-08-10',
    subject: '申论',
    content: '大作文写作技巧学习',
    duration: 3,
    status: '进行中'
  }
])

// 新建计划表单数据
const newPlan = ref({
  date: '',
  subject: '',
  content: '',
  duration: 2
})

// 对话框显示状态
const dialogVisible = ref(false)

// 当前日期
const currentDate = ref(new Date())

// 计算已完成计划数量
const completedCount = computed(() => {
  return studyPlans.value.filter(plan => plan.status === '已完成').length
})

// 计算总学习时长
const totalHours = computed(() => {
  return studyPlans.value.reduce((total, plan) => total + plan.duration, 0)
})

// 计算完成率
const completionRate = computed(() => {
  return Math.round((completedCount.value / studyPlans.value.length) * 100) || 0
})

// 格式化百分比
const percentageFormat = (percentage) => {
  return `完成率 ${percentage}%`
}

// 检查某天是否有学习计划
const hasStudyPlan = (day) => {
  return studyPlans.value.some(plan => plan.date === day)
}

// 创建新计划
const createPlan = () => {
  if (!newPlan.value.date || !newPlan.value.subject || !newPlan.value.content) {
    ElMessage.warning('请填写完整的计划信息')
    return
  }

  studyPlans.value.push({
    ...newPlan.value,
    date: newPlan.value.date.toISOString().split('T')[0],
    status: '进行中'
  })

  dialogVisible.value = false
  newPlan.value = {
    date: '',
    subject: '',
    content: '',
    duration: 2
  }
}

// 完成计划
const completePlan = (plan) => {
  plan.status = '已完成'
}

// 删除计划
const deletePlan = (plan) => {
  const index = studyPlans.value.indexOf(plan)
  if (index > -1) {
    studyPlans.value.splice(index, 1)
  }
}
</script>

<style scoped>
.study-plan-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-card,
.calendar-card {
  margin-bottom: 20px;
}

.stats-content {
  padding: 20px 0;
}

.stats-item {
  text-align: center;
  margin-bottom: 20px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.progress {
  margin-top: 20px;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.calendar-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #409EFF;
  margin-top: 2px;
}
</style>