import { v4 as uuidv4 } from 'uuid';

export const DocumentSchema = {
    documentId: {
      type: String,
      required: true,
      default: () => uuidv4(), 
    },
    filename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ['NDA Documents', 'IP Agreements', 'Executive Documents', 'Legal Documents'], 
    },
    fileUrl: {
      type: String,
      required: true,
    },
    createdAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString(), 
    },
    updatedAt: {
      type: String,
      required: true,
      default: () => new Date().toISOString(), 
    },
    uploadedBy: {
      type: String,
      required: true, 
    },
    isDeleted: {
      type: Boolean,
      default: false, 
    },
  };