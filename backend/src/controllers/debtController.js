const debtService = require('../services/debtService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const debts = await debtService.getAll(req.user.id);
    res.json(success('Debts retrieved.', debts));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const debt = await debtService.create(req.user.id, req.body);
    res.status(201).json(success('Debt created.', debt));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const debt = await debtService.update(req.params.id, req.user.id, req.body);
    res.json(success('Debt updated.', debt));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await debtService.remove(req.params.id, req.user.id);
    res.json(success('Debt deleted.', null));
  } catch (err) { next(err); }
};

const addPayment = async (req, res, next) => {
  try {
    const payment = await debtService.addPayment(req.params.id, req.user.id, req.body);
    res.status(201).json(success('Payment recorded.', payment));
  } catch (err) { next(err); }
};

const deletePayment = async (req, res, next) => {
  try {
    await debtService.deletePayment(req.params.paymentId, req.user.id);
    res.json(success('Payment deleted.', null));
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove, addPayment, deletePayment };
