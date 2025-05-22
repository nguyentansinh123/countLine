  export type User = {
    created_at: string;
    verifyOTP: string;
    resetOTPExpireAt: number;
    isAccountVerified: boolean;
    email: string;
    name: string;
    documents: { name: string }[];
    user_id: string;
    recentSearches: string[];
    teams: string[];
    role: string; // or: 'user' | 'admin' | 'client' if known
    profilePicture: string;
    resetOTP: string;
    verifyOTPExpiredAt: number;
  };
  
  export type DocumentTypeCounts = Record<string, number>;
  
  export type  DashboardStats= {
  teams: {
    current: number;
    dismissed: number;
    past: number;
    total: number;
  };
  projects: {
    current: number;
    dismissed: number;
    past: number;
    total: number;
  };
}

export type TeamStats ={
  active: number;
  inProgress: number;
  inactive: number;
  other: number;
  total: number;
}
export type ProjectStats = {
  finished: number;
  inProgress: number;
  drafted: number;
  cancelled: number;
  other: number;
  total: number;
}


 export interface File {
    documentId: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: string;
    status: string;
    documentType: string;
    fileUrl: string;
  }
