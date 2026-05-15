// Issue Routes — CampusCare API
// POST   /api/issues            — COMMUNITY_MEMBER : submit new issue
// GET    /api/issues/my         — COMMUNITY_MEMBER : get own issues
// GET    /api/issues/all        — FACILITY_MANAGER, ADMIN : get all issues
// GET    /api/issues/assigned   — WORKER : get assigned issues
// PATCH  /api/issues/:id/status — FACILITY_MANAGER, ADMIN : update status
// POST   /api/issues/:id/assign — FACILITY_MANAGER, ADMIN : assign worker
// PATCH  /api/issues/:id/in-progress — WORKER : mark in progress
// DELETE /api/issues/:id/manager     — FACILITY_MANAGER, ADMIN : delete issue
// DELETE /api/issues/:id             — COMMUNITY_MEMBER : delete own pending issue
const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
  assignWorker,
  getAssignedIssues,
  markInProgress,
  deleteIssue,
  deleteIssueManager,
} = require('../controllers/issue.controller');

router.post('/', authenticate, authorize('COMMUNITY_MEMBER'), upload.single('photo'), createIssue);
router.get('/my', authenticate, authorize('COMMUNITY_MEMBER'), getMyIssues);
router.get('/all', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), getAllIssues);
router.get('/assigned', authenticate, authorize('WORKER'), getAssignedIssues);
router.patch('/:id/status', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), updateIssueStatus);
router.post('/:id/assign', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), assignWorker);
router.patch('/:id/in-progress', authenticate, authorize('WORKER'), markInProgress);
router.delete('/:id/manager', authenticate, authorize('FACILITY_MANAGER', 'ADMIN'), deleteIssueManager);
router.delete('/:id', authenticate, authorize('COMMUNITY_MEMBER'), deleteIssue);

module.exports = router;
