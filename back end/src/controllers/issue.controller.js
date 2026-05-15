const prisma = require('../config/prisma');

const issueInclude = {
  submittedBy: { select: { id: true, name: true, email: true } },
  assignments: {
    include: { worker: { select: { id: true, name: true, email: true } } },
  },
  comments: {
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true, role: true } } },
  },
};

const createIssue = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: 'title, description, category and location are required' });
    }
    if (title.trim().length < 5) {
  return res.status(400).json({ message: 'Title must be at least 5 characters' });
}

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        location,
        photoUrl: req.file ? req.file.path : null,
        submittedById: req.user.id,
      },
    });

    return res.status(201).json(issue);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { submittedById: req.user.id },
      include: issueInclude,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(issues);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      include: issueInclude,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(issues);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: { status },
      include: issueInclude,
    });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ message: 'workerId is required' });
    }

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker || worker.role !== 'WORKER') {
      return res.status(400).json({ message: 'Worker not found or not a WORKER role' });
    }
    if (!worker.isActive) {
    return res.status(400).json({ message: 'Cannot assign an inactive worker' });
}
    const assignment = await prisma.assignment.upsert({
      where: { issueId_workerId: { issueId: id, workerId } },
      update: {},
      create: { issueId: id, workerId },
      include: { worker: { select: { id: true, name: true, email: true } } },
    });

    return res.status(200).json(assignment);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAssignedIssues = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { workerId: req.user.id },
      include: {
        issue: { include: issueInclude },
      },
    });

    const issues = assignments.map((a) => a.issue);
    return res.status(200).json(issues);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markInProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    if (issue.status === 'RESOLVED' || issue.status === 'CLOSED') {
  return res.status(400).json({ message: 'Cannot mark a resolved or closed issue as in progress' });
}

    const assignment = await prisma.assignment.findFirst({
      where: { issueId: id, workerId: req.user.id },
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this issue' });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: issueInclude,
    });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (issue.submittedById !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (issue.status !== 'PENDING') return res.status(400).json({ message: 'Only pending issues can be deleted' });

    await prisma.comment.deleteMany({ where: { issueId: id } });
    await prisma.assignment.deleteMany({ where: { issueId: id } });
    await prisma.issue.delete({ where: { id } });

    return res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteIssueManager = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    await prisma.comment.deleteMany({ where: { issueId: id } });
    await prisma.assignment.deleteMany({ where: { issueId: id } });
    await prisma.issue.delete({ where: { id } });

    return res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
  assignWorker,
  getAssignedIssues,
  markInProgress,
  deleteIssue,
  deleteIssueManager,
};
