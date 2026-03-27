const taskService = require('../services/taskService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { tasks, meta } = await taskService.getAll(req.query);
    return paginated(res, tasks, meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await taskService.getById(req.params.id);
    return success(res, task);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // If no assignedTo provided, auto-assign to the creator (tracks who submitted)
    const body = { ...req.body };
    if (!body.assignedTo && req.user?.id) body.assignedTo = req.user.id;
    const task = await taskService.create(body);
    return success(res, task, 'Task created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.id, req.body);
    return success(res, task, 'Task updated successfully.');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await taskService.remove(req.params.id);
    return success(res, null, 'Task deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
