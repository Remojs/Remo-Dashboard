const projectService = require('../services/projectService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { projects, meta } = await projectService.getAll(req.query);
    return paginated(res, projects, meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const project = await projectService.getById(req.params.id);
    return success(res, project);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const project = await projectService.create(req.body);
    return success(res, project, 'Project created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const project = await projectService.update(req.params.id, req.body);
    return success(res, project, 'Project updated successfully.');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await projectService.remove(req.params.id);
    return success(res, null, 'Project deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getMonthlyRevenue = async (req, res, next) => {
  try {
    const result = await projectService.getMonthlyRevenue(req.query.year);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, getMonthlyRevenue };
