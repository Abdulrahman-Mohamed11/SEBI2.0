require('dotenv/config');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const issueRoutes = require('./routes/issue.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
// ─── API Routes ───────────────────────────────────────────────────
// /api/auth    — registration, login, profile
// /api/issues  — issue CRUD, comments, assignment
// /api/admin   — admin-only user management
// /api/users   — shared user queries (e.g. workers list)
// ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
