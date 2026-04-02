const { Router } = require('express');
const incomeController = require('../controllers/incomeController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, incomeController.getAll);
router.get('/monthly', incomeController.getMonthlyTotal);
router.post('/', requireFields(['description', 'amount', 'source']), incomeController.create);
router.delete('/:id', incomeController.remove);

module.exports = router;
