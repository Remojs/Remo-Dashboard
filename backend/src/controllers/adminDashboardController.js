const adminDashboardService = require('../services/adminDashboardService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { dashboards, meta } = await adminDashboardService.getAll(req.query);
    return paginated(res, dashboards, meta);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const dashboard = await adminDashboardService.create(req.body);
    return success(res, dashboard, 'Admin dashboard created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await adminDashboardService.remove(req.params.id);
    return success(res, null, 'Admin dashboard deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, remove };
