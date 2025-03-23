import { Request, Response, NextFunction } from 'express';

declare module 'express' {
    interface Request {
        originalBody?: any; 
    }
}

export const preserveBody = (req: Request, res: Response, next: NextFunction) => {
    req.originalBody = req.body;
    next();
};