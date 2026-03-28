const { Router } = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields } = require('../middlewares/validateMiddleware');
const ctrl = require('../controllers/debtController');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', requireFields(['name', 'totalAmount']), ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/payments', requireFields(['amount']), ctrl.addPayment);
router.delete('/:id/payments/:paymentId', ctrl.deletePayment);

module.exports = router;
