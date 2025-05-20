export interface DocumentRevision {
  revisionId: string;
  fileUrl: string;
  editedBy: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  timestamp: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  message?: string;
  annotations?: any[];
  comments?: string[];
}

export interface Document {
  documentId: string;
  filename: string;
  fileType: string;
  documentType: string;
  fileUrl: string;
  presignedUrl?: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  isDeleted: boolean;
  
  // New fields for workflow
  sharedWith?: string[];
  revisions?: DocumentRevision[];
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  status?: 'draft' | 'in_review' | 'approved' | 'rejected' | 'signed';
  approvedRevisionId?: string;
  approvedAt?: string;
  
  // Signature related fields
  requiresSignature?: boolean;
  signaturesRequired?: string[];
  signedBy?: string[];
  signingStatus?: 'pending' | 'completed' | 'not_required';
}