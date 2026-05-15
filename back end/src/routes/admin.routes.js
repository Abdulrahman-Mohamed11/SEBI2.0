const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, toggleUserStatus, deleteUser } = require('../controllers/admin.controller');

router.get('/users', authenticate, authorize('ADMIN'), getAllUsers);
router.patch('/users/:id/toggle', authenticate, authorize('ADMIN'), toggleUserStatus);
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);

module.exports = router;
