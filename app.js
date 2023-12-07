const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const app = express();

const { tasksRouter } = require("./routes/api");

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _, res, __) => {
  let { status = 500, message = "Server error" } = err;

  if (message.includes("ENOENT")) {
    message = "Server error";
  }

  res.status(status).json({ message });
});

module.exports = app;
