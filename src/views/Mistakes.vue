<template>
  <div class="mistakes-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>筛选</span>
            </div>
          </template>
          <div class="filter-content">
            <div class="filter-item">
              <div class="filter-label">科目：</div>
              <el-select v-model="filters.subject" placeholder="选择科目" style="width: 100%">
                <el-option label="行测" value="行测" />
                <el-option label="申论" value="申论" />
              </el-select>
            </div>
            <div class="filter-item">
              <div class="filter-label">题型：</div>
              <el-select v-model="filters.type" placeholder="选择题型" style="width: 100%">
                <el-option label="言语理解" value="言语理解" />
                <el-option label="数量关系" value="数量关系" />
                <el-option label="判断推理" value="判断推理" />
                <el-option label="资料分析" value="资料分析" />
              </el-select>
            </div>
            <div class="filter-item">
              <div class="filter-label">掌握程度：</div>
              <el-select v-model="filters.mastery" placeholder="选择掌握程度" style="width: 100%">
                <el-option label="待复习" value="待复习" />
                <el-option label="已掌握" value="已掌握" />
              </el-select>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>错题统计</span>
            </div>
          </template>
          <div class="stats-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="stats-item">
                  <div class="stats-value">{{ totalMistakes }}</div>
                  <div class="stats-label">总错题数</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stats-item">
                  <div class="stats-value">{{ masteredCount }}</div>
                  <div class="stats-label">已掌握</div>
                </div>
              </el-col>
            </el-row>
            <el-progress
              :percentage="masteryRate"
              :format="percentageFormat"
              class="progress"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="mistakes-list">
          <template #header>
            <div class="card-header">
              <span>错题列表</span>
              <el-button type="primary" @click="startReview">开始复习</el-button>
            </div>
          </template>
          <el-table :data="filteredMistakes" style="width: 100%">
            <el-table-column prop="date" label="添加日期" width="120" />
            <el-table-column prop="subject" label="科目" width="80" />
            <el-table-column prop="type" label="题型" width="100" />
            <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
            <el-table-column prop="mastery" label="掌握程度" width="100">
              <template #default="{ row }">
                <el-tag :type="row.mastery === '已掌握' ? 'success' : 'warning'">
                  {{ row.mastery }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewDetail(row)">查看</el-button>
                <el-button link type="success" @click="markAsMastered(row)">标记已掌握</el-button>
                <el-button link type="danger" @click="deleteMistake(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错题详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="错题详情"
      width="60%"
    >
      <div class="mistake-detail" v-if="currentMistake">
        <div class="detail-item">
          <div class="detail-label">题目：</div>
          <div class="detail-content">{{ currentMistake.content }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">正确答案：</div>
          <div class="detail-content">{{ currentMistake.answer }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">解析：</div>
          <div class="detail-content">{{ currentMistake.explanation }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">我的笔记：</div>
          <el-input
            v-model="currentMistake.notes"
            type="textarea"
            rows="4"
            placeholder="添加笔记..."
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 筛选条件
const filters = ref({
  subject: '',
  type: '',
  mastery: ''
})

// 错题列表数据
const mistakes = ref([
  {
    id: 1,
    date: '2023-08-10',
    subject: '行测',
    type: '判断推理',
    content: '以下逻辑判断题...',
    answer: 'B',
    explanation: '本题考察逻辑推理能力...',
    mastery: '待复习',
    notes: ''
  },
  {
    id: 2,
    date: '2023-08-10',
    subject: '行测',
    type: '数量关系',
    content: '小明和小红分别...',
    answer: 'C',
    explanation: '解题关键是找到数量关系...',
    mastery: '已掌握',
    notes: '注意数量关系的基本解题思路'
  }
])

// 对话框显示状态
const dialogVisible = ref(false)

// 当前查看的错题
const currentMistake = ref(null)

// 根据筛选条件过滤错题
const filteredMistakes = computed(() => {
  return mistakes.value.filter(item => {
    if (filters.value.subject && item.subject !== filters.value.subject) return false
    if (filters.value.type && item.type !== filters.value.type) return false
    if (filters.value.mastery && item.mastery !== filters.value.mastery) return false
    return true
  })
})

// 总错题数
const totalMistakes = computed(() => mistakes.value.length)

// 已掌握的题目数量
const masteredCount = computed(() => {
  return mistakes.value.filter(item => item.mastery === '已掌握').length
})

// 掌握率
const masteryRate = computed(() => {
  return Math.round((masteredCount.value / totalMistakes.value) * 100) || 0
})

// 格式化百分比
const percentageFormat = (percentage) => {
  return `掌握率 ${percentage}%`
}

// 查看错题详情
const viewDetail = (row) => {
  currentMistake.value = { ...row }
  dialogVisible.value = true
}

// 标记为已掌握
const markAsMastered = (row) => {
  const index = mistakes.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    mistakes.value[index].mastery = '已掌握'
  }
}

// 删除错题
const deleteMistake = (row) => {
  const index = mistakes.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    mistakes.value.splice(index, 1)
  }
}

// 开始复习
const startReview = () => {
  // 实现错题复习功能
  console.log('开始复习')
}
</script>

<style scoped>
.mistakes-container {
  padding: 20px;
}

.filter-card,
.stats-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
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

.mistakes-list {
  min-height: calc(100vh - 140px);
}

.mistake-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.detail-content {
  line-height: 1.6;
  color: #606266;
}
</style>