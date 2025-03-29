import { v4 as uuidv4 } from 'uuid';

export const ProjectSchema = {
  projectId: {
    type: String,
    required: true,
    default: () => uuidv4(),
  },
  projectName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  projectStart: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
      },
      message: 'Start date must be in DD/MM/YYYY format'
    }
  },
  projectEnd: {
    type: String,
    validate: {
      validator: (value: string) => {
        if (!value) return true; // Optional field
        return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
      },
      message: 'End date must be in DD/MM/YYYY format'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['Finished', 'In Progress', 'Drafted', 'Cancelled'],
    default: 'Drafted',
  },
  teams: {
    type: [String], // Array of team IDs
    default: []
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
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
    validate: {
      validator: (value: string) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
      message: 'Creator ID must be a valid UUID'
    }
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  budget: {
    type: Number,
    min: 0,
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (value: string[]) => value.length <= 10,
      message: 'Maximum 10 tags allowed'
    }
  }
};