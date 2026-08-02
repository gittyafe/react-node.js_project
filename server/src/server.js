require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const examRoutes = require("./routes/exam.route");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/exams", examRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running`);
});