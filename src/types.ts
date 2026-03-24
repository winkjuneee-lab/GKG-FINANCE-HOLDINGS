export type LoanFrequency = 'quarterly' | 'semi-annual' | 'annual';
export type LoanStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
export type LoanClass = 'starter' | 'standard' | 'premium' | 'platinum';
export type UserRole = 'client' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  duration: number;
  frequency: LoanFrequency;
  status: LoanStatus;
  loanClass: LoanClass;
  interestRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppDocument {
  id: string;
  applicationId: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}
