const expenseService = require('../services/expenseService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { expenses, meta } = await expenseService.getAll(req.query);
    return paginated(res, expenses, meta);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const expense = await expenseService.create(req.body);
    return success(res, expense, 'Expense created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await expenseService.remove(req.params.id);
    return success(res, null, 'Expense deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getMonthlyTotal = async (req, res, next) => {
  try {
    const data = await expenseService.getMonthlyTotal(req.query.year);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, remove, getMonthlyTotal };
