import { Request, Response } from "express";
import { ScanCommand,QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from '../lib/dynamoClient';


const getAllUser = async (req: Request, res:Response) => {
    try {
        const scanParams = {
            TableName: 'Users', 
          };
        const data = await docClient.send(new ScanCommand(scanParams));
        const moreSecuredData = data.Items?.map(user => {
            const { password, ...moreSecuredData } = user; 
            return moreSecuredData;
          });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: moreSecuredData,
          });
    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
    
        console.error("Error in getAllUser:", message);
        res.status(500).json({ success: false, message });
    }
  }

  const getSingleUser = async (req: Request, res:Response) => {
    try {
        const {id} = req.params;

        const queryParams = {
            TableName: 'Users', // Replace with your table name
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
              ':user_id': id,
            },
          };

          const result = await docClient.send(new QueryCommand(queryParams));

          if (!result.Items || result.Items.length === 0) {
            res.status(404).json({ success: false, message: "User not found" });
            throw new Error("User not found");
          }
          const user = result.Items[0];
          const { password, ...userWithoutPassword } = user;
          
          res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: userWithoutPassword,
          });

    } catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
    
        console.error("Error in getSingleUser:", message);
        res.status(500).json({ success: false, message });
    }
  }

export {getAllUser,getSingleUser} ;