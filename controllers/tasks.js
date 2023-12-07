const { HttpError, ctrlWrapper } = require("../helpers");
const { Task } = require("../models");

const deleteTaskAndChildren = async (deletedTask) => {
  await Promise.all(
    deletedTask.subtasks.map(async (subtaskId) => {
      const subtask = await Task.findById(subtaskId);
      if (!subtask) {
        return;
      }
      await deleteTaskAndChildren(subtask);
    })
  );

  await Task.findByIdAndDelete(deletedTask._id);
};

const getAllRoots = async (req, res) => {
  const rootTasks = await Task.find({ parent: null }).populate("subtasks");

  res.json(rootTasks);
};

const getAll = async (req, res) => {
  const tasks = await Task.find().populate("subtasks");

  res.json(tasks);
};

const getById = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId).populate("subtasks");

  if (!task) {
    throw HttpError(404, "Not Found");
  }

  res.json(task);
};

const add = async (req, res) => {
  const { title, parent } = req.body;

  let newTask;
  let parentTask;

  if (parent) {
    parentTask = await Task.findById(parent);
  }

  if (parentTask) {
    newTask = await Task.create({ title, parent, subtasks: [] });

    parentTask.subtasks.push(newTask._id);

    await parentTask.save();
  } else {
    newTask = await Task.create({ title, parent: null, subtasks: [] });
  }

  res.status(201).json(newTask);
};

const deleteById = async (req, res) => {
  const { taskId } = req.params;

  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) {
    throw HttpError(404, "Task not found");
  }

  await deleteTaskAndChildren(deletedTask);

  if (deletedTask.parent) {
    const parentTask = await Task.findById(deletedTask.parent);

    if (parentTask) {
      const withoutDeletedTask = parentTask.subtasks.filter(
        (subtask) => !subtask._id.equals(deletedTask._id)
      );

      await Task.findByIdAndUpdate(deletedTask.parent, {
        subtasks: withoutDeletedTask,
      });
    }
  }

  res.status(204).json(deletedTask);
};

const updateById = async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { title },
    { new: true }
  );

  if (!updatedTask) {
    throw HttpError(404, "Task not found");
  }

  res.json(updatedTask);
};

const moveTask = async (req, res) => {
  const { taskId, newIndex } = req.params;

  const taskToMove = await Task.findById(taskId);

  if (!taskToMove) {
    throw HttpError(404, "Task not found");
  }

  const parentTask = taskToMove.parent
    ? await Task.findById(taskToMove.parent)
    : null;

  if (!parentTask) {
    const rootTasksList = await Task.find({ parent: null });

    if (newIndex < 0 || newIndex >= rootTasksList.length) {
      throw HttpError(400, "Invalid index");
    }

    const removedTaskIndex = rootTasksList.findIndex((subtask) =>
      subtask._id.equals(taskId)
    );

    const [removedTask] = rootTasksList.splice(removedTaskIndex, 1);

    rootTasksList.splice(newIndex, 0, removedTask);

    await Task.deleteMany({ parent: null });
    await Task.insertMany(rootTasksList);

    res.json({ message: "Task moved successfully" });
  } else {
    if (newIndex < 0 || newIndex >= parentTask.subtasks.length) {
      throw HttpError(400, "Invalid index");
    }

    const removedTaskIndex = parentTask.subtasks.findIndex((subtask) =>
      subtask._id.equals(taskId)
    );

    const [removedTask] = parentTask.subtasks.splice(removedTaskIndex, 1);

    parentTask.subtasks.splice(newIndex, 0, removedTask);

    await Task.updateOne(
      { _id: parentTask._id },
      { subtasks: parentTask.subtasks }
    );

    res.json({ message: "Task moved successfully" });
  }
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  deleteById: ctrlWrapper(deleteById),
  updateById: ctrlWrapper(updateById),
  moveTask: ctrlWrapper(moveTask),
  getAllRoots: ctrlWrapper(getAllRoots),
};
