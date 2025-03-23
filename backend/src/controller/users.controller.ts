import { Request, Response } from "express";
import { ScanCommand,QueryCommand, GetCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
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
            TableName: 'Users', 
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

  const getAllUserDocuments = async (req: Request, res:Response) => {
    try {

      const { user_id } = req.body;

      if (!user_id) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
    }

      const userParams = {
        TableName: "Users",
        Key: {
            user_id: user_id, 
        },
    };

      const { Item: user } = await docClient.send(new GetCommand(userParams));

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
      const documentIds = user.documents || [];

      if (documentIds.length === 0) {
        res.status(200).json({
            success: true,
            message: "No documents found for this user",
            data: [],
        });
        return;
    }

    const documentParams = {
      RequestItems: {
          Documents: {
              Keys: documentIds.map((documentId: string) => ({ documentId })),
          },
      },
  };
  const { Responses: documents } = await docClient.send(new BatchGetCommand(documentParams));

  res.status(200).json({
    success: true,
    message: "Documents fetched successfully",
    data: documents?.Documents || [],
  });
      
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
  
      console.error("Error in getSingleUser:", message);
      res.status(500).json({ success: false, message });
    }
  }

  const getSingleUserDocument = async (req: Request, res:Response) => {
    try {
      const { documentID } = req.params; 
      const { user_id } = req.body;

      if (!documentID) {
        res.status(400).json({ success: false, message: "Document ID is required" });
        return
    }

      const documentParams = {
        TableName: "Documents",
        Key: {
            documentId: documentID,
        },
    };

    const { Item: document } = await docClient.send(new GetCommand(documentParams));

      if (!document) {
        res.status(404).json({ success: false, message: "Document not found" });
        return
    }

      res.status(200).json({
        success: true,
        message: "Document fetched successfully",
        data: document,
    });

    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;

      console.error("Error in getSingleUserDocument:", message);
      res.status(500).json({ success: false, message });
    }

  }

export {getAllUser,getSingleUser,getAllUserDocuments,getSingleUserDocument} ;