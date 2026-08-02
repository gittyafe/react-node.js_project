const Exam = require("../models/exam.model");

const getAllExams = async (req, res) => {
  const exams = await Exam.find();

  res.json(exams);
};

const createExam = async (req, res) => {
  const exam = await Exam.create(req.body);

  res.status(201).json(exam);
};

module.exports = {
  getAllExams,
  createExam,
};