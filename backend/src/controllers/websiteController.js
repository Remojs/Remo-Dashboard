const websiteService = require('../services/websiteService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { websites, meta } = await websiteService.getAll(req.query);
    return paginated(res, websites, meta);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const website = await websiteService.create(req.body);
    return success(res, website, 'Website added successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await websiteService.remove(req.params.id);
    return success(res, null, 'Website deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const data = await websiteService.getStatus(req.params.id, req.query);
    return paginated(res, data.statuses, data.meta);
  } catch (err) {
    next(err);
  }
};

const check = async (req, res, next) => {
  try {
    // Optional ?id=xxx to check a specific site
    const results = await websiteService.checkAndStore(req.query.id || null);
    return success(res, results, `Checked ${results.length} website(s).`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, remove, getStatus, check };
