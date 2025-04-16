<template>
  <div class="admin-container">
    <el-tabs v-model="activeTab">
      <!-- 题目管理 -->
      <el-tab-pane label="题目管理" name="questions">
        <div class="action-bar">
          <el-button type="primary" @click="showQuestionDialog = true">添加题目</el-button>
          <el-upload
            class="upload-btn"
            action="/api/questions/import"
            :show-file-list="false"
            :on-success="handleImportSuccess"
            :on-error="handleImportError"
            accept=".csv"
          >
            <el-button>导入题目</el-button>
          </el-upload>
          <el-button @click="handleExport">导出题目</el-button>
        </div>

        <el-table :data="questions" style="width: 100%" v-loading="loading">
          <el-table-column prop="subject" label="科目" width="100" />
          <el-table-column prop="type" label="题型" width="120" />
          <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="{ row }">
              {{ row.difficulty }} / 5
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

  

        <el-pagination
          v-model:current-page="questionPage"
          v-model:page-size="questionLimit"
          :total="questionTotal"
          layout="total, prev, pager, next"
          @current-change="fetchQuestions"
        />

        <!-- 题目表单对话框 -->
        <el-dialog
          v-model="showQuestionDialog"
          :title="editingQuestion ? '编辑题目' : '添加题目'"
          width="60%"
        >
          <el-form :model="questionForm" label-width="100px">
            <el-form-item label="科目">
              <el-select v-model="questionForm.subject">
                <el-option label="行测" value="行测" />
                <el-option label="申论" value="申论" />
              </el-select>
            </el-form-item>
            <el-form-item label="题型">
              <el-select v-model="questionForm.type">
                <el-option label="言语理解" value="言语理解" />
                <el-option label="数量关系" value="数量关系" />
                <el-option label="判断推理" value="判断推理" />
                <el-option label="资料分析" value="资料分析" />
              </el-select>
            </el-form-item>
            <el-form-item label="题目内容">
              <el-input v-model="questionForm.content" type="textarea" rows="4" />
            </el-form-item>
            <el-form-item label="选项">
              <div v-for="(option, index) in questionForm.options" :key="index" class="option-item">
                <el-input v-model="option.key" style="width: 60px" />
                <el-input v-model="option.content" style="width: calc(100% - 120px)" />
                <el-button type="danger" @click="removeOption(index)">删除</el-button>
              </div>
              <el-button type="primary" @click="addOption">添加选项</el-button>
            </el-form-item>
            <el-form-item label="正确答案">
              <el-select v-model="questionForm.answer">
                <el-option
                  v-for="option in questionForm.options"
                  :key="option.key"
                  :label="option.key"
                  :value="option.key"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="解析">
              <el-input v-model="questionForm.explanation" type="textarea" rows="3" />
            </el-form-item>
            <el-form-item label="难度">
              <el-rate v-model="questionForm.difficulty" :max="5" />
            </el-form-item>
            <el-form-item label="标签">
              <el-tag
                v-for="tag in questionForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="showTagInput"
                v-model="newTag"
                class="tag-input"
                size="small"
                @keyup.enter="addTag"
                @blur="addTag"
              />
              <el-button v-else size="small" @click="showTagInput = true">添加标签</el-button>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showQuestionDialog = false">取消</el-button>
            <el-button type="primary" @click="saveQuestion">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 笔记管理 -->
      <el-tab-pane label="笔记管理" name="notes">
        <div class="action-bar">
          <el-button type="primary" @click="showNoteDialog = true">添加笔记</el-button>
        </div>

        <el-table :data="notes" style="width: 100%">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="editNote(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteNote(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

  

        <el-pagination
          v-model:current-page="notePage"
          v-model:page-size="noteLimit"
          :total="noteTotal"
          layout="total, prev, pager, next"
          @current-change="fetchNotes"
        />

        <!-- 笔记表单对话框 -->
        <el-dialog
          v-model="showNoteDialog"
          :title="editingNote ? '编辑笔记' : '添加笔记'"
          width="60%"
        >
          <el-form :model="noteForm" label-width="100px">
            <el-form-item label="标题">
              <el-input v-model="noteForm.title" />
            </el-form-item>
            <el-form-item label="分类">
              <el-input v-model="noteForm.category" />
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="noteForm.content" type="textarea" rows="6" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showNoteDialog = false">取消</el-button>
            <el-button type="primary" @click="saveNote">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 学习计划管理 -->
      <el-tab-pane label="学习计划管理" name="studyPlans">
        <div class="action-bar">
          <el-button type="primary" @click="showPlanDialog = true">添加计划</el-button>
        </div>

        <el-table :data="studyPlans" style="width: 100%">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="startDate" label="开始时间" width="180" />
          <el-table-column prop="endDate" label="结束时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="editPlan(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deletePlan(row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

  

        <el-pagination
          v-model:current-page="planPage"
          v-model:page-size="planLimit"
          :total="planTotal"
          layout="total, prev, pager, next"
          @current-change="fetchPlans"
        />

        <!-- 学习计划表单对话框 -->
        <el-dialog
          v-model="showPlanDialog"
          :title="editingPlan ? '编辑计划' : '添加计划'"
          width="60%"
        >
          <el-form :model="planForm" label-width="100px">
            <el-form-item label="标题">
              <el-input v-model="planForm.title" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="planForm.description" type="textarea" rows="3" />
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="planForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </el-form-item>
            <el-form-item label="任务列表">
              <div v-for="(task, index) in planForm.tasks" :key="index" class="task-item">
                <el-input v-model="task.title" style="width: calc(100% - 200px)" />
                <el-date-picker v-model="task.dueDate" type="date" placeholder="截止日期" />
                <el-button type="danger" @click="removeTask(index)">删除</el-button>
              </div>
              <el-button type="primary" @click="addTask">添加任务</el-button>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showPlanDialog = false">取消</el-button>
            <el-button type="primary" @click="savePlan">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as questionApi from '../api/questions';

// 标签页
const activeTab = ref('questions');

// 数据列表相关
const loading = ref(false);

// 题目管理
const questions = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const showQuestionDialog = ref(false);
const questionForm = ref({
  subject: '',
  type: '',
  content: '',
  options: [],
  answer: '',
  explanation: '',
  difficulty: 3,
  tags: []
});
const showTagInput = ref(false);
const newTag = ref('');

// 获取题目列表
const fetchQuestions = async () => {
  try {
    loading.value = true;
    const { data, total: totalCount } = await questionApi.getQuestions({
      page: currentPage.value,
      limit: pageSize.value
    });
    questions.value = data;
    total.value = totalCount;
  } catch (error) {
    ElMessage.error('获取题目列表失败');
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchQuestions();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchQuestions();
};

// 题目表单处理
const resetQuestionForm = () => {
  questionForm.value = {
    subject: '',
    type: '',
    content: '',
    options: [],
    answer: '',
    explanation: '',
    difficulty: 3,
    tags: []
  };
  editingQuestion.value = null;
};

const handleEdit = (row) => {
  editingQuestion.value = row;
  questionForm.value = { ...row };
  showQuestionDialog.value = true;
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该题目吗？', '提示', {
      type: 'warning'
    });
    await questionApi.deleteQuestion(id);
    ElMessage.success('删除成功');
    fetchQuestions();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleSaveQuestion = async () => {
  try {
    if (editingQuestion.value) {
      await questionApi.updateQuestion(editingQuestion.value._id, questionForm.value);
      ElMessage.success('更新成功');
    } else {
      await questionApi.createQuestion(questionForm.value);
      ElMessage.success('添加成功');
    }
    showQuestionDialog.value = false;
    resetQuestionForm();
    fetchQuestions();
  } catch (error) {
    ElMessage.error(editingQuestion.value ? '更新失败' : '添加失败');
  }
};

// 选项处理
const addOption = () => {
  questionForm.value.options.push({ key: '', content: '' });
};

const removeOption = (index) => {
  questionForm.value.options.splice(index, 1);
};

// 标签处理
const handleTagInputConfirm = () => {
  const tag = newTag.value.trim();
  if (tag && !questionForm.value.tags.includes(tag)) {
    questionForm.value.tags.push(tag);
  }
  showTagInput.value = false;
  newTag.value = '';
};

const removeTag = (tag) => {
  const index = questionForm.value.tags.indexOf(tag);
  if (index > -1) {
    questionForm.value.tags.splice(index, 1);
  }
};

// 导入导出处理
const handleImportSuccess = () => {
  ElMessage.success('导入成功');
  fetchQuestions();
};

const handleImportError = () => {
  ElMessage.error('导入失败');
};

const handleExport = async () => {
  try {
    await questionApi.exportQuestions();
    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  }
};

// 初始化
// 笔记管理
const notes = ref([]);
const notePage = ref(1);
const noteLimit = ref(10);
const noteTotal = ref(0);
const showNoteDialog = ref(false);
const editingNote = ref(null);
const noteForm = ref({
  title: '',
  category: '',
  content: ''
});

// 学习计划管理
const studyPlans = ref([]);
const planPage = ref(1);
const planLimit = ref(10);
const planTotal = ref(0);
const showPlanDialog = ref(false);
const editingPlan = ref(null);
const planForm = ref({
  title: '',
  description: '',
  dateRange: [],
  tasks: []
});

onMounted(() => {
  fetchQuestions();
  fetchNotes();
  fetchPlans();
});

const saveQuestion = async () => {
  try {
    const method = editingQuestion.value ? 'PUT' : 'POST';
    const url = editingQuestion.value
      ? `/api/questions/${editingQuestion.value._id}`
      : '/api/questions';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionForm.value)
    });

    if (response.ok) {
      ElMessage.success(editingQuestion.value ? '更新成功' : '添加成功');
      showQuestionDialog.value = false;
      fetchQuestions();
    }
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

const editQuestion = (question) => {
  editingQuestion.value = question;
  questionForm.value = { ...question };
  showQuestionDialog.value = true;
};

const deleteQuestion = async (id) => {
  try {
    const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    if (response.ok) {
      ElMessage.success('删除成功');
      fetchQuestions();
    }
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 笔记管理方法
const fetchNotes = async () => {
  try {
    const response = await fetch(`/api/notes?page=${notePage.value}&limit=${noteLimit.value}`);
    const data = await response.json();
    notes.value = data.data;
    noteTotal.value = data.total;
  } catch (error) {
    ElMessage.error('获取笔记列表失败');
  }
};

const saveNote = async () => {
  try {
    const method = editingNote.value ? 'PUT' : 'POST';
    const url = editingNote.value
      ? `/api/notes/${editingNote.value._id}`
      : '/api/notes';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteForm.value)
    });

    if (response.ok) {
      ElMessage.success(editingNote.value ? '更新成功' : '添加成功');
      showNoteDialog.value = false;
      fetchNotes();
    }
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

const editNote = (note) => {
  editingNote.value = note;
  noteForm.value = { ...note };
  showNoteDialog.value = true;
};

const deleteNote = async (id) => {
  try {
    const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (response.ok) {
      ElMessage.success('删除成功');
      fetchNotes();
    }
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 学习计划管理方法
const fetchPlans = async () => {
  try {
    const response = await fetch(`/api/study-plans?page=${planPage.value}&limit=${planLimit.value}`);
    const data = await response.json();
    studyPlans.value = data.data;
    planTotal.value = data.total;
  } catch (error) {
    ElMessage.error('获取学习计划列表失败');
  }
};

const addTask = () => {
  planForm.value.tasks.push({ title: '', dueDate: null });
};

const removeTask = (index) => {
  planForm.value.tasks.splice(index, 1);
};

const savePlan = async () => {
  try {
    const formData = {
      ...planForm.value,
      startDate: planForm.value.dateRange[0],
      endDate: planForm.value.dateRange[1]
    };
    delete formData.dateRange;

    const method = editingPlan.value ? 'PUT' : 'POST';
    const url = editingPlan.value
      ? `/api/study-plans/${editingPlan.value._id}`
      : '/api/study-plans';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      ElMessage.success(editingPlan.value ? '更新成功' : '添加成功');
      showPlanDialog.value = false;
      fetchPlans();
    }
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

const editPlan = (plan) => {
  editingPlan.value = plan;
  planForm.value = {
    ...plan,
    dateRange: [plan.startDate, plan.endDate]
  };
  showPlanDialog.value = true;
};

const deletePlan = async (id) => {
  try {
    const response = await fetch(`/api/study-plans/${id}`, { method: 'DELETE' });
    if (response.ok) {
      ElMessage.success('删除成功');
      fetchPlans();
    }
  } catch (error) {
    ElMessage.error('删除失败');
  }
};
</script>

<style scoped>
.admin-container {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.upload-btn {
  display: inline-block;
  margin: 0 10px;
}

.option-item,
.task-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tag-input {
  width: 100px;
  margin-left: 10px;
  vertical-align: bottom;
}

.el-tag {
  margin-right: 10px;
}
</style>