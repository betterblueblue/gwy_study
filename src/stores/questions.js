import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

export const useQuestionsStore = defineStore('questions', {
  state: () => ({
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    activeSubject: '1',
    selectedTypes: ['1'],
    studyProgress: {
      dailyStudyHours: 0,
      consecutiveDays: 0,
      progressPercentage: 0
    },
    mistakes: {
      todayCount: 0,
      totalReviewCount: 0
    },
    examCountdown: 98
  }),

  getters: {
    currentQuestion: (state) => state.questions[state.currentQuestionIndex],
    isLastQuestion: (state) => state.currentQuestionIndex === state.questions.length - 1
  },

  actions: {
    async fetchQuestions() {
      try {
        const params = {
          subject: this.activeSubject === '1' ? '行测' : '申论',
          type: this.selectedTypes.map(type => {
            switch(type) {
              case '1': return '言语理解'
              case '2': return '数量关系'
              case '3': return '判断推理'
              case '4': return '资料分析'
              default: return ''
            }
          })[0]
        }
        const response = await axios.get(`${API_BASE_URL}/questions`, { params })
        this.questions = response.data
      } catch (error) {
        console.error('获取题目失败:', error)
      }
    },

    setActiveSubject(subject) {
      this.activeSubject = subject
      this.fetchQuestions()
    },

    setSelectedTypes(types) {
      this.selectedTypes = types
      this.fetchQuestions()
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        this.selectedAnswer = null
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
        this.selectedAnswer = null
      }
    },

    submitAnswer(answer) {
      this.selectedAnswer = answer
      // 记录错题
      if (answer !== this.currentQuestion.answer) {
        this.mistakes.todayCount++
        this.mistakes.totalReviewCount++
      }
    }
  }
})