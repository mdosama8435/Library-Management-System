const express = require('express');
const router = express.Router();
const {
  createMember,
  getMemberHistory,
  getMembers,
} = require('../controllers/memberController');
const authenticateLibrarian = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const {
  createMemberSchema,
  memberIdParamSchema,
} = require('../validators/memberValidator');

// GET /api/members - Protected: List all members (Librarian only)
router.get('/', authenticateLibrarian, getMembers);

// POST /api/members - Protected: Register new member (Librarian only)
router.post(
  '/',
  authenticateLibrarian,
  validate(createMemberSchema),
  createMember
);

// GET /api/members/:memberId/history - Protected: Get complete member borrowing history (Librarian operation)
router.get(
  '/:memberId/history',
  authenticateLibrarian,
  validate(memberIdParamSchema, 'params'),
  getMemberHistory
);

module.exports = router;
