<template>
  <div class="practice-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="subject-card">
          <template #header>
            <div class="card-header">
              <span>科目选择</span>
            </div>
          </template>
          <el-menu
            :default-active="activeSubject"
            @select="handleSubjectSelect"
          >
            <el-menu-item index="1">
              <el-icon><Document /></el-icon>
              <span>行测</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Edit /></el-icon>
              <span>申论</span>
            </el-menu-item>
          </el-menu>
        </el-card>

        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>题型筛选</span>
            </div>
          </template>
          <el-checkbox-group v-model="selectedTypes">
            <el-checkbox label="1">言语理解</el-checkbox>
            <el-checkbox label="2">数量关系</el-checkbox>
            <el-checkbox label="3">判断推理</el-checkbox>
            <el-checkbox label="4">资料分析</el-checkbox>
          </el-checkbox-group>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="question-card">
          <template #header>
            <div class="card-header">
              <span>{{ currentQuestion.type }} - 第{{ currentQuestionIndex + 1 }}题</span>
              <div class="timer">剩余时间：{{ formatTime(remainingTime) }}</div>
            </div>
          </template>
          <div class="question-content">
            <div class="question-text">{{ currentQuestion.content }}</div>
            <el-radio-group v-model="selectedAnswer" class="answer-options">
              <el-radio 
                v-for="option in currentQuestion.options" 
                :key="option.key" 
                :label="option.key"
                class="answer-option"
              >
                {{ option.key }}. {{ option.content }}
              </el-radio>
            </el-radio-group>
          </div>
          <div class="question-actions">
            <el-button @click="previousQuestion" :disabled="currentQuestionIndex === 0">
              上一题
            </el-button>
            <el-button type="primary" @click="nextQuestion">
              {{ isLastQuestion ? '提交' : '下一题' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Document, Edit } from '@element-plus/icons-vue'
import { useQuestionsStore } from '../stores/questions'

const questionsStore = useQuestionsStore()

// 剩余时间（秒）
const remainingTime = ref(3600) // 1小时

onMounted(async () => {
  await questionsStore.fetchQuestions()
})

// 模拟题目数据
const questions = computed(() => questionsStore.questions)

// 当前选中的科目
const activeSubject = computed(() => questionsStore.activeSubject)

// 选中的题型
const selectedTypes = computed(() => questionsStore.selectedTypes)

// 计算当前题目
const currentQuestion = computed(() => questionsStore.currentQuestion)

// 是否是最后一题
const isLastQuestion = computed(() => questionsStore.isLastQuestion)

// 选中的答案
const selectedAnswer = computed({
  get: () => questionsStore.selectedAnswer,
  set: (value) => questionsStore.submitAnswer(value)
})

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 处理科目选择
const handleSubjectSelect = (index) => {
  questionsStore.setActiveSubject(index)
}

// 上一题
const previousQuestion = () => {
  questionsStore.previousQuestion()
}

// 下一题或提交
const nextQuestion = () => {
  if (isLastQuestion.value) {
    // TODO: 实现提交逻辑
    console.log('提交答案')
  } else {
    questionsStore.nextQuestion()
  }
}

</script>

<style scoped>
.practice-container {
  padding: 20px;
}

.subject-card,
.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-card {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.timer {
  color: #409EFF;
  font-weight: bold;
}

.question-content {
  flex: 1;
  padding: 20px 0;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.answer-options {
  display: flex;
  flex-direction: column;
}

.answer-option {
  margin: 10px 0;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.filter-card :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>