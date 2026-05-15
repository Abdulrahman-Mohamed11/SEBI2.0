const prisma = require('../config/prisma');

const getWorkers = async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: 'WORKER', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(workers);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getWorkers };
