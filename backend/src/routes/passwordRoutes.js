const { Router } = require('express');
const passwordController = require('../controllers/passwordController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, passwordController.getAll);
router.get('/:id/decrypt', passwordController.getDecrypted);
router.post('/', requireFields(['service', 'username', 'password']), passwordController.create);
router.put('/:id', passwordController.update);
router.delete('/:id', passwordController.remove);

module.exports = router;
