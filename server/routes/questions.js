const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const { createObjectCsvWriter } = require('csv-writer');
const { Question } = require('../models');

// 配置文件上传
const upload = multer({ dest: 'uploads/' });

// 导入题目
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要导入的文件' });
    }

    const parser = csv.parse({
      columns: true,
      skip_empty_lines: true
    });

    const records = [];
    const fileStream = fs.createReadStream(req.file.path)
      .pipe(parser)
      .on('data', (data) => {
        records.push({
          subject: data.subject,
          type: data.type,
          content: data.content,
          options: JSON.parse(data.options || '[]'),
          answer: data.answer,
          explanation: data.explanation,
          difficulty: parseInt(data.difficulty) || 3,
          tags: data.tags ? data.tags.split(',') : []
        });
      })
      .on('end', async () => {
        try {
          await Question.insertMany(records);
          // 删除临时文件
          fs.unlinkSync(req.file.path);
          res.json({ message: `成功导入 ${records.length} 条题目` });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出题目
router.get('/export', async (req, res) => {
  try {
    const questions = await Question.find();
    const csvWriter = createObjectCsvWriter({
      path: 'exports/questions.csv',
      header: [
        { id: 'subject', title: '科目' },
        { id: 'type', title: '题型' },
        { id: 'content', title: '题目内容' },
        { id: 'options', title: '选项' },
        { id: 'answer', title: '答案' },
        { id: 'explanation', title: '解析' },
        { id: 'difficulty', title: '难度' },
        { id: 'tags', title: '标签' }
      ]
    });

    const records = questions.map(q => ({
      subject: q.subject,
      type: q.type,
      content: q.content,
      options: JSON.stringify(q.options),
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      tags: q.tags.join(',')
    }));

    await csvWriter.writeRecords(records);
    res.download('exports/questions.csv', 'questions.csv', (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      // 删除临时文件
      fs.unlinkSync('exports/questions.csv');
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;