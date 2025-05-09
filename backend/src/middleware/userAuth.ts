import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
    id: string;
    role?: string; 
}

interface RequestWithUser extends Request {
    user?: JwtPayload;
}

export const userAuth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const {tdToken} = req.cookies;

    if (!tdToken) {
        res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        return;
    }
    if (!process.env.JWT_SECRET) {
        res.status(500).json({ success: false, message: "JWT_SECRET is not defined in environment variables" });
        return;
    }
    try {
        const tokenDecode = jwt.verify(tdToken, process.env.JWT_SECRET) as JwtPayload;

        if(tokenDecode.id) {
            const { GetCommand } = await import('@aws-sdk/lib-dynamodb');
            const { docClient } = await import('../lib/dynamoClient');
            
            const getUserParams = {
                TableName: 'Users',
                Key: { user_id: tokenDecode.id }
            };
            
            const userData = await docClient.send(new GetCommand(getUserParams));
            
            if (!userData.Item) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            
            req.body.user_id = tokenDecode.id;
            req.user = {
                id: tokenDecode.id,
                role: userData.Item.role || 'user'
            };
            
            console.log("User ID:", tokenDecode.id);
            console.log("User Role:", req.user.role);
            next();
        } else {
            res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        }
    } catch (error) {
        let message = 'Unknown Error'
        if (error instanceof Error) message = error.message
        console.log(message)
        res.status(500).json({ success: false, message: message });
    }
}