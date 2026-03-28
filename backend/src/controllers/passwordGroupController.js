const passwordGroupService = require('../services/passwordGroupService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const groups = await passwordGroupService.getAll(req.user.id);
    return success(res, groups);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const group = await passwordGroupService.create(req.user.id, req.body);
    return success(res, group, 'Group created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const group = await passwordGroupService.update(req.params.id, req.user.id, req.body);
    return success(res, group, 'Group updated successfully.');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await passwordGroupService.remove(req.params.id, req.user.id);
    return success(res, null, 'Group deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
