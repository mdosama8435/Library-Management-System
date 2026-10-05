const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    membershipId: {
      type: String,
      required: [true, 'Membership ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    joinedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique indexes for email and membershipId are defined directly on the fields
const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
