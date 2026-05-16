const prisma = require('../config/prisma');

const addComment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (content.length > 1000) {
  return res.status(400).json({ message: 'Comment must be 1000 characters or less' });
}

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        photoUrl: req.file ? req.file.path : null,
        issueId,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addComment, getComments };
