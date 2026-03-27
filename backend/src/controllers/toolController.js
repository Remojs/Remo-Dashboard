const toolService = require('../services/toolService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { tools, meta } = await toolService.getAll(req.query);
    return paginated(res, tools, meta);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const tool = await toolService.create(req.body);
    return success(res, tool, 'Tool created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await toolService.remove(req.params.id);
    return success(res, null, 'Tool deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, remove };
