export type UserRole = 'finder' | 'claimer' | 'admin';

export interface User {
  id: string;
  fullName: string;
  studentId: string;
  contactNumber: string;
  email: string;
  role: UserRole;
}

export interface LostItem {
  id: string;
  itemType: string;
  location: string;
  dateFound: string;
  foundDate?: string; // Alias for dateFound
  timeFound: string;
  photoUrl: string;
  description?: string;
  securityQuestions: SecurityQuestion[];
  reportedBy: string;
  status: 'pending' | 'verified' | 'claimed';
  reportedAt: string;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  claimCode: string;
  answers: string[];
  proofPhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'item_reported' | 'item_verified' | 'item_rejected' | 'claim_submitted' | 'claim_approved' | 'claim_rejected' | 'failed_claim_attempt' | 'item_status_changed';
  itemId?: string;
  itemType?: string;
  details: string;
}
