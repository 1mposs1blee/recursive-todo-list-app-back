const express = require("express");
const { tasksCtrl } = require("../../controllers");
const { validateBody, isValidId } = require("../../middlewares");
const { tasksSchemas } = require("../../models");

const router = express.Router();

router.get("/roots", tasksCtrl.getAllRoots);

router.get("/", tasksCtrl.getAll);

router.get("/:taskId", isValidId, tasksCtrl.getById);

router.post("/", validateBody(tasksSchemas.post), tasksCtrl.add);

router.delete("/:taskId", isValidId, tasksCtrl.deleteById);

router.put(
  "/:taskId",
  isValidId,
  validateBody(tasksSchemas.put),
  tasksCtrl.updateById
);

router.patch("/:taskId/move/:newIndex", isValidId, tasksCtrl.moveTask);

module.exports = router;
