const express = require("express");

const router = express.Router();

const {
  getAllExams,
  createExam,
} = require("../controllers/exam.controller");

router.get("/", getAllExams);

router.post("/", createExam);

module.exports = router;