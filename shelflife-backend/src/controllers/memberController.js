const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');
const { AppError } = require('../middleware/errorMiddleware');

/**
 * @desc    Register a new library member
 * @route   POST /api/members
 * @access  Protected (Librarian only)
 */
const createMember = async (req, res, next) => {
  try {
    const { name, email, membershipId } = req.body;
    const formattedEmail = email.trim().toLowerCase();
    const formattedMembershipId = membershipId.trim().toUpperCase();

    // Check if email already registered
    const existingEmail = await Member.findOne({ email: formattedEmail });
    if (existingEmail) {
      return next(
        new AppError(`Member with email '${formattedEmail}' already exists`, 409)
      );
    }

    // Check if membership ID already registered
    const existingMembershipId = await Member.findOne({
      membershipId: formattedMembershipId,
    });
    if (existingMembershipId) {
      return next(
        new AppError(
          `Member with membershipId '${formattedMembershipId}' already exists`,
          409
        )
      );
    }

    const member = await Member.create({
      name: name.trim(),
      email: formattedEmail,
      membershipId: formattedMembershipId,
    });

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complete borrowing history for a specific member
 * @route   GET /api/members/:memberId/history
 * @access  Protected (Librarian operation)
 */
const getMemberHistory = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    // Verify member exists in database
    const member = await Member.findById(memberId);
    if (!member) {
      return next(new AppError('Member not found', 404));
    }

    // Overdue Handling Strategy:
    // We synchronize the database state during retrieval by updating any unreturned
    // record whose dueDate has elapsed from 'issued' to 'overdue'.
    // Reason: Updating MongoDB directly guarantees persistent consistency across
    // queries, administrative reports, and subsequent frontend requests, ensuring
    // that the database reflects real-world state without phantom discrepancies.
    const now = new Date();
    await BorrowRecord.updateMany(
      {
        member: memberId,
        status: 'issued',
        returnDate: null,
        dueDate: { $lt: now },
      },
      {
        $set: { status: 'overdue' },
      }
    );

    // Retrieve all borrow records for this member, populated with book details,
    // sorted by issueDate descending (latest first)
    const history = await BorrowRecord.find({ member: memberId })
      .populate('book', 'title author ISBN genre totalCopies availableCopies')
      .sort({ issueDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all members
 * @route   GET /api/members
 * @access  Protected (Librarian only)
 */
const getMembers = async (req, res, next) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMember,
  getMemberHistory,
  getMembers,
};
