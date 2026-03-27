const { Router } = require('express');
const toolController = require('../controllers/toolController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, toolController.getAll);
router.post('/', requireFields(['name', 'url', 'color', 'emoji']), toolController.create);
router.delete('/:id', toolController.remove);

module.exports = router;
