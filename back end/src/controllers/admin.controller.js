const prisma = require('../config/prisma');

// ============================================================
// Admin Controller — CampusCare API
// Handles all admin-only user management operations
// All functions require ADMIN role (enforced at route level)
// ============================================================

// ── GET /api/admin/users ─────────────────────────────────────
// Returns all users sorted by newest first
// Supports optional ?role= query filter (e.g. ?role=WORKER)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const whereClause = role ? { role } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      count: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /api/admin/users/:id/toggle ────────────────────────
// Activates or deactivates a user account
// Guards: user must exist, admin cannot deactivate themselves
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Guard: admin cannot change their own account status
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own account status' });
    }

    // Guard: cannot deactivate another ADMIN account
    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Cannot change the status of another admin account' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const statusLabel = updated.isActive ? 'activated' : 'deactivated';
    return res.status(200).json({
      message: `User account ${statusLabel} successfully`,
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/admin/users/:id ──────────────────────────────
// Permanently deletes a user and all their related data
// Guards: user must exist, cannot delete self, cannot delete ADMIN
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Guard: admin cannot delete their own account
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Guard: cannot delete another ADMIN account
    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Cannot delete another admin account' });
    }

    // Delete all related data before deleting the user
    await prisma.comment.deleteMany({ where: { authorId: id } });
    await prisma.assignment.deleteMany({ where: { workerId: id } });
    await prisma.issue.deleteMany({ where: { submittedById: id } });
    await prisma.user.delete({ where: { id } });

    return res.json({
      message: 'User and all related data deleted successfully',
      deletedUserId: id,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllUsers, toggleUserStatus, deleteUser };