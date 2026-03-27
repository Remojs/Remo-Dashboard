const passwordService = require('../services/passwordService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { records, meta } = await passwordService.getAll(req.user.id, req.query);
    return paginated(res, records, meta);
  } catch (err) {
    next(err);
  }
};

const getDecrypted = async (req, res, next) => {
  try {
    const record = await passwordService.getDecrypted(req.params.id, req.user.id);
    return success(res, record);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const record = await passwordService.create(req.user.id, req.body);
    return success(res, record, 'Password stored successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const record = await passwordService.update(req.params.id, req.user.id, req.body);
    return success(res, record, 'Password updated successfully.');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await passwordService.remove(req.params.id, req.user.id);
    return success(res, null, 'Password deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getDecrypted, create, update, remove };
