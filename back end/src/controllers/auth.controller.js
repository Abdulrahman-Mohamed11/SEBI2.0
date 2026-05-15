const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

const ALLOWED_REGISTER_ROLES = ['COMMUNITY_MEMBER', 'FACILITY_MANAGER', 'WORKER'];

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (role && !ALLOWED_REGISTER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || 'COMMUNITY_MEMBER',
      },
    });

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('[register] Error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  return res.status(200).json(userWithoutPassword);
};

module.exports = { register, login, getMe };
