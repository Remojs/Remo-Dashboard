const debtService = require('../services/debtService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const debts = await debtService.getAll(req.user.id);
    return success(res, debts, 'Debts retrieved.');
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const debt = await debtService.create(req.user.id, req.body);
    return success(res, debt, 'Debt created.', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const debt = await debtService.update(req.params.id, req.user.id, req.body);
    return success(res, debt, 'Debt updated.');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await debtService.remove(req.params.id, req.user.id);
    return success(res, null, 'Debt deleted.');
  } catch (err) { next(err); }
};

const addPayment = async (req, res, next) => {
  try {
    const payment = await debtService.addPayment(req.params.id, req.user.id, req.body);
    return success(res, payment, 'Payment recorded.', 201);
  } catch (err) { next(err); }
};

const deletePayment = async (req, res, next) => {
  try {
    await debtService.deletePayment(req.params.paymentId, req.user.id);
    return success(res, null, 'Payment deleted.');
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove, addPayment, deletePayment };
