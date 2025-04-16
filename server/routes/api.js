const express = require('express');
const router = express.Router();
const { Question, Note, StudyPlan, Mistake } = require('../models');

// 题目管理API
router.get('/questions', async (req, res) => {
  try {
    const { subject, type, page = 1, limit = 10 } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (type) query.type = type;

    const questions = await Question.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Question.countDocuments(query);

    res.json({ data: questions, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 笔记管理API
router.get('/notes', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = category ? { category } : {};

    const notes = await Note.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Note.countDocuments(query);

    res.json({ data: notes, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 学习计划API
router.get('/study-plans', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const studyPlans = await StudyPlan.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await StudyPlan.countDocuments();

    res.json({ data: studyPlans, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/study-plans', async (req, res) => {
  try {
    const studyPlan = new StudyPlan(req.body);
    await studyPlan.save();
    res.status(201).json(studyPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/study-plans/:id', async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(studyPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/study-plans/:id', async (req, res) => {
  try {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 错题记录API
router.get('/mistakes', async (req, res) => {
  try {
    const { mastery, page = 1, limit = 10 } = req.query;
    const query = mastery ? { mastery } : {};

    const mistakes = await Mistake.find(query)
      .populate('questionId')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Mistake.countDocuments(query);

    res.json({ data: mistakes, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/mistakes', async (req, res) => {
  try {
    const mistake = new Mistake(req.body);
    await mistake.save();
    res.status(201).json(mistake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/mistakes/:id', async (req, res) => {
  try {
    const mistake = await Mistake.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(mistake);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/mistakes/:id', async (req, res) => {
  try {
    await Mistake.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;