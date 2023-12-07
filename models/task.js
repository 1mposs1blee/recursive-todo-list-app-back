const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { handleMongooseError } = require("../helpers");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "task",
    },
    subtasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "task",
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

taskSchema.post("save", handleMongooseError);

const post = Joi.object({
  title: Joi.string().min(5).required().messages({
    "string.base": "Title should be a string",
    "string.min": "Title should have a minimum length of 5",
    "any.required": "Title is required",
  }),
  parent: Joi.string().hex().length(24).messages({
    "string.base": "Parent should be a string",
    "string.hex": "Parent should be an ObjectId format",
    "string.length": "Parent should have a length of 24",
  }),
});

const put = Joi.object({
  title: Joi.string().min(5).required(),
});

const tasksSchemas = { post, put };

const Task = model("task", taskSchema);

module.exports = { Task, tasksSchemas };
