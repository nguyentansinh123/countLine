export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  verifyOTP?: string;
  verifyOTPExpiredAt?: number;
  isAccountVerified?: boolean;
  resetOTP?: string;
  resetOTPExpiredAt?: number;
  role: "employee" | "client" | "intern" | "admin" | "user";
  documents?: string[];
  teams?: string[];
  profilePicture?: string;
}
