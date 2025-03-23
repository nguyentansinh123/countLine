import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// interface JwtPayload {
//     id: string;
//   }

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {

    const {tdToken} = req.cookies;

    if (!tdToken) {
        throw new Error("Not Authorized Login Again");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
    try {
        const tokenDecode = jwt.verify(tdToken, process.env.JWT_SECRET) as any;

        if(tokenDecode.id) {
            req.body.user_id = tokenDecode.id;
            console.log("User ID:", tokenDecode.id);
            
        }else{
            throw new Error("Not Authorized Login Again");
        }
        next();
    } catch (error) {
        let message = 'Unknown Error'
        if (error instanceof Error) message = error.message
        console.log(message)
        res.status(500).json({ success: false, message: message })
    }

}