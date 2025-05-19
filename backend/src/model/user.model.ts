import { Stream } from "nodemailer/lib/xoauth2";
import { v4 as uuidv4 } from "uuid";

export const UserSchema = {
  id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOTP: {
    type: String,
    default: "",
  },
  verifyOTPExpiredAt: {
    type: Number,
    default: 0,
  },
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  resetOTP: {
    type: String,
    default: "",
  },
  resetOTPExpireAt: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["employee", "client", "intern", "admin", "user"],
  },
  documents: {
    type: [
      {
        documentId: String,
        fileName: String,
        fileUrl: String,
        filyType: String,
      },
    ],
    default: [],
  },
  teams: {
    type: [String],
    default: [],
  },
  profilePicture: {
    type: String,
    default: "",
  },
  recentSearches: {
    type: [
      {
        userId: String,
        name: String,
        profilePicture: String,
        timestamp: Number,
      },
    ],
    default: [],
    maxLength: 3,
  },
};
