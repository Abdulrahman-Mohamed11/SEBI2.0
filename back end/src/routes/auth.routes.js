// POST /api/auth/register  — Public  : create a new user account
// POST /api/auth/login     — Public  : authenticate and return JWT token
// GET  /api/auth/me        — Private : return current user profile (requires token)

const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;
