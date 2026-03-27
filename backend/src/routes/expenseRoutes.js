const { Router } = require('express');
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, expenseController.getAll);
router.get('/monthly', expenseController.getMonthlyTotal);
router.post('/', requireFields(['description', 'amount', 'category']), expenseController.create);
router.delete('/:id', expenseController.remove);

module.exports = router;
