// ============================================================
// Admin Routes — CampusCare API
// Base path: /api/admin
// Access: ADMIN role only (protected by authenticate + authorize)
// ============================================================
//
// GET    /users            — Retrieve list of all registered users
// PATCH  /users/:id/toggle — Activate or deactivate a user account
// DELETE /users/:id        — Permanently delete a user and all their data
//
// All routes require: Bearer JWT token with role === 'ADMIN'
// ============================================================

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, toggleUserStatus, deleteUser } = require('../controllers/admin.controller');

// ── Param Validation Middleware ──────────────────────────────
// Validates that :id is a non-empty string before hitting the controller
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || id.trim() === '') {
    return res.status(400).json({ message: 'User ID is required' });
  }
  next();
};

// ── Routes ───────────────────────────────────────────────────
router.get('/users', authenticate, authorize('ADMIN'), getAllUsers);
router.patch('/users/:id/toggle', authenticate, authorize('ADMIN'), validateId, toggleUserStatus);
router.delete('/users/:id', authenticate, authorize('ADMIN'), validateId, deleteUser);

module.exports = router;