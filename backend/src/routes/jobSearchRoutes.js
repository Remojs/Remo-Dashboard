const { Router } = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields } = require('../middlewares/validateMiddleware');
const ctrl = require('../controllers/jobSearchController');

const router = Router();

router.use(authenticate);

// Job boards
router.get('/boards', ctrl.getAllBoards);
router.post('/boards', requireFields(['name', 'url']), ctrl.createBoard);
router.delete('/boards/:id', ctrl.removeBoard);

// Job applications
router.get('/applications', ctrl.getAllApplications);
router.post('/applications', requireFields(['company', 'position']), ctrl.createApplication);
router.put('/applications/:id', ctrl.updateApplication);
router.delete('/applications/:id', ctrl.removeApplication);

module.exports = router;
