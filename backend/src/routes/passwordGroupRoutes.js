const { Router } = require('express');
const passwordGroupController = require('../controllers/passwordGroupController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', passwordGroupController.getAll);
router.post('/', requireFields(['name']), passwordGroupController.create);
router.put('/:id', requireFields(['name']), passwordGroupController.update);
router.delete('/:id', passwordGroupController.remove);

module.exports = router;
