const mongoose = require('mongoose');

// 题目模型
const QuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true }, // 科目：行测、申论
  type: { type: String, required: true }, // 题型：言语理解、数量关系等
  content: { type: String, required: true }, // 题目内容
  options: [{ // 选项
    key: String,
    content: String
  }],
  answer: { type: String, required: true }, // 正确答案
  explanation: String, // 解析
  difficulty: { type: Number, default: 3 }, // 难度：1-5
  tags: [String], // 标签
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 笔记模型
const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: String, // 分类
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 学习计划模型
const StudyPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  tasks: [{
    title: String,
    completed: { type: Boolean, default: false },
    dueDate: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 错题记录模型
const MistakeSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  wrongAnswer: String, // 错误答案
  mastery: { type: String, default: '待复习' }, // 掌握程度
  reviewCount: { type: Number, default: 0 }, // 复习次数
  nextReviewDate: Date, // 下次复习日期
  notes: String, // 错题笔记
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', QuestionSchema);
const Note = mongoose.model('Note', NoteSchema);
const StudyPlan = mongoose.model('StudyPlan', StudyPlanSchema);
const Mistake = mongoose.model('Mistake', MistakeSchema);

module.exports = {
  Question,
  Note,
  StudyPlan,
  Mistake
};