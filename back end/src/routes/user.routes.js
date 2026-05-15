const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getWorkers } = require('../controllers/user.controller');

router.get('/workers', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), getWorkers);

module.exports = router;
