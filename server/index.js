const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 连接MongoDB数据库
mongoose.connect('mongodb://localhost:27017/gwy_study', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 定义题目Schema
const questionSchema = new mongoose.Schema({
  type: String,
  content: String,
  options: [{
    key: String,
    content: String
  }],
  answer: String,
  subject: String
});

const Question = mongoose.model('Question', questionSchema);

// API路由
app.get('/api/questions', async (req, res) => {
  try {
    const { subject, type } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (type) query.type = type;
    
    const questions = await Question.find(query);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});