const userService = require('../services/userService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { users, meta } = await userService.getAll(req.query);
    return paginated(res, users, meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    return success(res, user, 'User created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    return success(res, user, 'User updated successfully.');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id);
    return success(res, null, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const user = await userService.updateRole(req.params.id, req.body.role);
    return success(res, user, 'User role updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, updateRole };
