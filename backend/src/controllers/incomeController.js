const incomeService = require('../services/incomeService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { incomes, meta } = await incomeService.getAll(req.query);
    return paginated(res, incomes, meta);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const income = await incomeService.create(req.body);
    return success(res, income, 'Income created successfully.', 201);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await incomeService.remove(req.params.id);
    return success(res, null, 'Income deleted successfully.');
  } catch (err) { next(err); }
};

const getMonthlyTotal = async (req, res, next) => {
  try {
    const data = await incomeService.getMonthlyTotal(req.query.year);
    return success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getAll, create, remove, getMonthlyTotal };
