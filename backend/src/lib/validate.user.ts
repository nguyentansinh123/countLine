import { v4 as uuidv4 } from 'uuid';

export const validateUser = (user: any) => {
  const errors: string[] = [];

  if (!user.name) errors.push("Name is required");
  if (!user.email) errors.push("Email is required");
  if (!user.password) errors.push("Password is required");

  if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push("Invalid email format");
  }

  const allowedRoles = ['employee', 'client', 'intern', 'admin', 'user'];
  if (user.role && !allowedRoles.includes(user.role)) {
    errors.push("Invalid role");
  }

  if (user.recentSearches) {
    if (!Array.isArray(user.recentSearches)) {
      errors.push("recentSearches must be an array");
    } else {
      user.recentSearches.forEach((search: any, index: number) => {
        if (!search.userId) errors.push(`recentSearches[${index}].userId is required`);
        if (!search.name) errors.push(`recentSearches[${index}].name is required`);
        if (search.timestamp && typeof search.timestamp !== 'number') {
          errors.push(`recentSearches[${index}].timestamp must be a number`);
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  return {
    user_id: uuidv4(), 
    name: user.name,
    email: user.email,
    password: user.password,
    verifyOTP: user.verifyOTP || '',
    verifyOTPExpiredAt: user.verifyOTPExpiredAt || 0,
    isAccountVerified: user.isAccountVerified || false,
    resetOTP: user.resetOTP || '',
    resetOTPExpireAt: user.resetOTPExpireAt || 0,
    role: user.role || 'user', 
    documents: user.documents || [], 
    teams: user.teams || [], 
    profilePicture: user.profilePicture || '', 
    created_at: new Date().toISOString(), 
    recentSearches: user.recentSearches || [],
  };
};