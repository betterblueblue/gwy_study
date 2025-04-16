import { defineStore } from 'pinia'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    mistakes: [],
    todayTasks: [
      {
        content: '行测：数量关系专项练习',
        time: '09:00-10:30',
        status: 'success'
      },
      {
        content: '申论：材料分析练习',
        time: '14:00-15:30',
        status: 'primary'
      },
      {
        content: '错题复习',
        time: '16:00-17:00',
        status: 'info'
      }
    ]
  }),

  actions: {
    async fetchNotes() {
      try {
        // TODO: 替换为实际的API调用
        const response = await fetch('/api/notes')
        const data = await response.json()
        this.notes = data
      } catch (error) {
        console.error('获取笔记失败:', error)
      }
    },

    async fetchMistakes() {
      try {
        // TODO: 替换为实际的API调用
        const response = await fetch('/api/mistakes')
        const data = await response.json()
        this.mistakes = data
      } catch (error) {
        console.error('获取错题失败:', error)
      }
    },

    async addNote(note) {
      try {
        // TODO: 替换为实际的API调用
        await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(note)
        })
        await this.fetchNotes()
      } catch (error) {
        console.error('添加笔记失败:', error)
      }
    },

    async addMistake(mistake) {
      try {
        // TODO: 替换为实际的API调用
        await fetch('/api/mistakes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mistake)
        })
        await this.fetchMistakes()
      } catch (error) {
        console.error('添加错题失败:', error)
      }
    },

    async updateTodayTasks(tasks) {
      this.todayTasks = tasks
      // TODO: 添加任务更新到后端的逻辑
    }
  }
})