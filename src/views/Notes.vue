<template>
  <div class="notes-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="category-card">
          <template #header>
            <div class="card-header">
              <span>笔记分类</span>
              <el-button type="primary" link @click="addCategory">添加分类</el-button>
            </div>
          </template>
          <el-menu
            :default-active="activeCategory"
            @select="handleCategorySelect"
          >
            <el-menu-item
              v-for="category in categories"
              :key="category.id"
              :index="category.id.toString()"
            >
              <el-icon><Folder /></el-icon>
              <span>{{ category.name }}</span>
              <template #title>
                <span>{{ category.name }}</span>
                <span class="note-count">({{ category.count }})</span>
              </template>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="notes-list">
          <template #header>
            <div class="card-header">
              <div class="search-box">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索笔记..."
                  prefix-icon="Search"
                  clearable
                />
              </div>
              <el-button type="primary" @click="createNote">新建笔记</el-button>
            </div>
          </template>
          <el-table :data="filteredNotes" style="width: 100%">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="editNote(row)">编辑</el-button>
                <el-button link type="danger" @click="deleteNote(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新建/编辑笔记对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑笔记' : '新建笔记'"
      width="80%"
    >
      <el-form :model="noteForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="noteForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="noteForm.category" placeholder="选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <div class="editor-toolbar">
            <el-button-group>
              <el-button @click="formatText('bold')">
                <el-icon><Bold /></el-icon>
              </el-button>
              <el-button @click="formatText('italic')">
                <el-icon><Italic /></el-icon>
              </el-button>
              <el-button @click="formatText('underline')">
                <el-icon><TextUnderline /></el-icon>
              </el-button>
            </el-button-group>
            <el-button-group>
              <el-button @click="insertList('bullet')">
                <el-icon><List /></el-icon>
              </el-button>
              <el-button @click="insertList('ordered')">
                <el-icon><Sort /></el-icon>
              </el-button>
            </el-button-group>
          </div>
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="15"
            placeholder="请输入笔记内容..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNote">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="添加分类"
      width="400px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Folder, Search, Bold, Italic, TextUnderline, List, Sort } from '@element-plus/icons-vue'

// 笔记分类
const categories = ref([
  { id: 1, name: '行测笔记', count: 5 },
  { id: 2, name: '申论笔记', count: 3 },
  { id: 3, name: '时政要点', count: 8 }
])

// 当前选中的分类
const activeCategory = ref('1')

// 搜索关键词
const searchQuery = ref('')

// 笔记列表
const notes = ref([
  {
    id: 1,
    title: '数量关系解题技巧',
    category: '行测笔记',
    content: '1. 方程法：...',
    updateTime: '2023-08-10 14:30'
  },
  {
    id: 2,
    title: '申论大作文框架',
    category: '申论笔记',
    content: '一、开头部分：...',
    updateTime: '2023-08-10 16:45'
  }
])

// 根据搜索条件过滤笔记
const filteredNotes = computed(() => {
  return notes.value.filter(note => {
    const matchCategory = !activeCategory.value || 
      note.category === categories.value.find(c => c.id.toString() === activeCategory.value)?.name
    const matchQuery = !searchQuery.value || 
      note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCategory && matchQuery
  })
})

// 笔记表单数据
const noteForm = ref({
  title: '',
  category: '',
  content: ''
})

// 分类表单数据
const categoryForm = ref({
  name: ''
})

// 对话框显示状态
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)

// 是否是编辑模式
const isEdit = ref(false)

// 处理分类选择
const handleCategorySelect = (index) => {
  activeCategory.value = index
}

// 创建笔记
const createNote = () => {
  isEdit.value = false
  noteForm.value = {
    title: '',
    category: '',
    content: ''
  }
  dialogVisible.value = true
}

// 编辑笔记
const editNote = (note) => {
  isEdit.value = true
  noteForm.value = { ...note }
  dialogVisible.value = true
}

// 保存笔记
const saveNote = () => {
  if (!noteForm.value.title || !noteForm.value.category || !noteForm.value.content) {
    ElMessage.warning('请填写完整的笔记信息')
    return
  }

  if (isEdit.value) {
    // 更新笔记逻辑
  } else {
    // 新建笔记逻辑
    notes.value.push({
      id: Date.now(),
      ...noteForm.value,
      updateTime: new Date().toLocaleString()
    })
  }

  dialogVisible.value = false
}

// 删除笔记
const deleteNote = (note) => {
  ElMessageBox.confirm(
    '确定要删除这条笔记吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = notes.value.findIndex(item => item.id === note.id)
    if (index > -1) {
      notes.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 添加分类
const addCategory = () => {
  categoryForm.value.name = ''
  categoryDialogVisible.value = true
}

// 保存分类
const saveCategory = () => {
  if (!categoryForm.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }

  categories.value.push({
    id: Date.now(),
    name: categoryForm.value.name,
    count: 0
  })

  categoryDialogVisible.value = false
}

// 文本格式化
const formatText = (type) => {
  // 实现文本格式化功能
  console.log('Format text:', type)
}

// 插入列表
const insertList = (type) => {
  // 实现插入列表功能
  console.log('Insert list:', type)
}
</script>

<style scoped>
.notes-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  width: 300px;
}

.note-count {
  margin-left: 5px;
  color: #909399;
  font-size: 12px;
}

.notes-list {
  min-height: calc(100vh - 140px);
}

.editor-toolbar {
  margin-bottom: 10px;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 10px;
}

.editor-toolbar .el-button-group {
  margin-right: 10px;
}
</style>