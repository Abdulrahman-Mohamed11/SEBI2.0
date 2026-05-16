const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { addComment, getComments } = require('../controllers/comment.controller');

router.post('/:issueId/comments', authenticate, authorize('WORKER', 'FACILITY_MANAGER', 'ADMIN'), upload.single('photo'), addComment);
router.get('/:issueId/comments', authenticate, getComments);

module.exports = router;
