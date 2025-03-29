import { v4 as uuidv4 } from 'uuid';

export const TeamSchema = {
  teamId: {
    type: String,
    required: true,
    default: () => uuidv4(),
  },
  teamName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  teamSize: {
    type: Number,
    required: true,
    min: 1,
    max: 50, 
  },
  dateCreated: {
    type: String,
    required: true,
    default: () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    },
    validate: {
      validator: (value: string) => {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
      },
      message: 'Date must be in DD/MM/YYYY format'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'In Progress', 'Inactive'],
    default: 'Active',
  },
  members: {
    type: [String], 
    default: [],
    validate: {
      validator: (value: string[]) => value.length <= 50, 
      message: 'Maximum team size exceeded'
    }
  },
  projects: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String, // User ID of the creator
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
};