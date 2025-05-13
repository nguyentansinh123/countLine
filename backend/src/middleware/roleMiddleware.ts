import { Request, Response, NextFunction } from 'express';

interface UserRequest extends Request {
  user?: {
    role: string;
  };
}

const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: UserRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: `Access denied, you are not authorized ${allowedRoles}` });
      return;
    }
    next();
  };
};

export default authorizeRoles;